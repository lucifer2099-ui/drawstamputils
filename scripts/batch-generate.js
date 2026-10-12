import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// 处理 ESM 下的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const customeDir = path.join(rootDir, 'custome');
const outputBaseDir = path.join(customeDir, 'output');

// 常见 Chrome & Edge 路径列表（Windows 平台）
function findChromeExecutable() {
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
        path.join(os.homedir(), 'AppData\\Local\\Microsoft\\Edge\\Application\\msedge.exe'),
    ];

    for (const p of paths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return null;
}

// 获取非冲突的输出目录名，实现“不覆盖原有图片”
function getUniqueOutputDir(baseName) {
    if (!fs.existsSync(outputBaseDir)) {
        fs.mkdirSync(outputBaseDir, { recursive: true });
    }

    let targetDir = path.join(outputBaseDir, baseName);
    if (!fs.existsSync(targetDir)) {
        return targetDir;
    }

    let counter = 1;
    while (true) {
        targetDir = path.join(outputBaseDir, `${baseName}_${counter}`);
        if (!fs.existsSync(targetDir)) {
            return targetDir;
        }
        counter++;
    }
}

async function main() {
    console.log('====== 📥 开始解析数据与加载模板 ======');

    // 1. 读取 Excel 公司列表 并自动将目标企业的张数设置为 20（满足“一个企业20张”和“默认生成一张”）
    const excelPath = path.join(customeDir, 'company.xlsx');
    if (!fs.existsSync(excelPath)) {
        console.error(`❌ 未找到 Excel 文件: ${excelPath}`);
        process.exit(1);
    }

    // 自动重写/更新 Excel 里的生成数
    let excelRows = [];
    try {
        const wb = XLSX.readFile(excelPath);
        excelRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    } catch (e) {}

    let needsUpdate = false;
    if (excelRows.length === 0) {
        excelRows = [{ company: '书法印章有限公司', '生成数量': 20 }];
        needsUpdate = true;
    } else {
        excelRows.forEach(row => {
            if (row.company === '书法印章有限公司') {
                let foundKey = null;
                for (const k in row) {
                    if (k !== 'company') {
                        foundKey = k;
                        break;
                    }
                }
                const keyToUse = foundKey || '生成数量';
                if (row[keyToUse] !== 20) {
                    row[keyToUse] = 20;
                    needsUpdate = true;
                }
            }
        });
    }

    if (needsUpdate) {
        const ws = XLSX.utils.json_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, excelPath);
        console.log('📝 已自动将 Excel 里的 [书法印章有限公司] 生成数量更新为 20 张。');
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);
    const companies = rows.map(row => {
        const name = row.company;
        if (!name) return null;

        // 寻找除 company 之外的数字列，若有则作为生成张数，没有则默认 1 张
        let count = 1;
        for (const key in row) {
            if (key !== 'company') {
                const val = parseInt(row[key], 10);
                if (!isNaN(val) && val > 0) {
                    count = val;
                    break;
                }
            }
        }
        return { name, count };
    }).filter(Boolean);

    console.log(`📋 Excel 解析成功，共获取到 ${companies.length} 个目标企业:`);
    console.log(companies.map(c => ` - ${c.name} (生成数量: ${c.count}张)`).join('\n'));

    // 2. 扫描并匹配 JSON 模板
    const templates = [];
    const files = fs.readdirSync(customeDir);
    for (const file of files) {
        if (file.endsWith('.json')) {
            const filePath = path.join(customeDir, file);
            try {
                const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                let templateCompanyName = '';
                if (config.company && config.company.companyName) {
                    templateCompanyName = config.company.companyName;
                } else if (config.companyList && config.companyList[0] && config.companyList[0].companyName) {
                    templateCompanyName = config.companyList[0].companyName;
                }

                if (templateCompanyName) {
                    templates.push({
                        fileName: file,
                        companyName: templateCompanyName,
                        config
                    });
                }
            } catch (err) {
                console.warn(`⚠️ 解析模板文件失败: ${file}, 错误:`, err.message);
            }
        }
    }

    console.log(`📂 共加载了 ${templates.length} 个 JSON 印章模板。`);

    // Build a map for O(1) template lookups
    const templateMap = new Map();
    for (const t of templates) {
        templateMap.set(t.companyName, t);
    }

    // 3. 查找 Chrome 可执行文件
    const chromePath = findChromeExecutable();
    if (!chromePath) {
        console.error('❌ 错误: 未能在系统中查找到已安装的 Chrome 或 Edge 浏览器。请安装 Chrome 后再试。');
        process.exit(1);
    }
    console.log(`🔍 查找到本地 Chrome 引擎路径: ${chromePath}`);

    // 4. 启动 Vite 开发服务器（提供前端 Canvas 渲染宿主环境）
    console.log('⚡ 正在启动临时印章渲染服务器...');
    const server = await createServer({
        root: rootDir,
        server: {
            port: 5199,
            host: 'localhost',
            fs: {
                allow: [rootDir]
            }
        }
    });
    await server.listen();
    const serverUrl = 'http://localhost:5199';
    console.log(`🚀 临时服务器已启动并监听: ${serverUrl}`);

    // 5. 启动 Puppeteer Headless 浏览器
    console.log('🤖 正在启动 Headless 渲染浏览器...');
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(serverUrl, { waitUntil: 'networkidle2' });
    console.log('🌐 浏览器渲染视口已就绪。');

    // 6. 执行批量生成
    console.log('\n====== 🎨 开始批量渲染印章 ======');
    for (const item of companies) {
        const companyName = item.name;
        const generateCount = item.count;
        
        // 查找精准匹配的模板
        const matched = templateMap.get(companyName);
        if (!matched) {
            console.warn(`⚠️  未找到匹配的公司名称模板，跳过生成: ${companyName}`);
            continue;
        }

        console.log(`✨ [${companyName}] 匹配到模板 [${matched.fileName}]，开始生成 ${generateCount} 张防伪印章...`);
        const targetDir = getUniqueOutputDir(companyName);

        for (let i = 1; i <= generateCount; i++) {
            // 在浏览器中渲染这一张印章，并刷新毛边与防伪切线参数
            const base64Data = await page.evaluate(async (configObj, idx) => {
                // 1. 创建临时的 Canvas 并挂在 body 上
                let canvas = document.getElementById('batch-render-canvas');
                if (!canvas) {
                    canvas = document.createElement('canvas');
                    canvas.id = 'batch-render-canvas';
                    canvas.width = 600;
                    canvas.height = 600;
                    canvas.style.position = 'absolute';
                    canvas.style.top = '-9999px';
                    canvas.style.left = '-9999px';
                    document.body.appendChild(canvas);
                }

                // 2. 实例化 DrawStampUtils
                if (!window.DrawStampUtils) {
                    throw new Error('全局挂载的 DrawStampUtils 未定义');
                }
                const utils = new window.DrawStampUtils(canvas, 10);
                
                // 3. 应用并克隆模板配置
                const currentConfig = JSON.parse(JSON.stringify(configObj));
                
                // 确保防伪和毛边参数开启，以便刷新能生效
                if (currentConfig.securityPattern) {
                    currentConfig.securityPattern.openSecurityPattern = true;
                }
                if (currentConfig.roughEdge) {
                    currentConfig.roughEdge.drawRoughEdge = true;
                }
                // 确保五角星的毛边和做旧参数在批处理中也生效
                if (currentConfig.drawStar) {
                    currentConfig.drawStar.drawRoughEdge = true;
                    currentConfig.drawStar.drawAging = true;
                    if (currentConfig.drawStar.roughEdgeCount === undefined) currentConfig.drawStar.roughEdgeCount = 15;
                    if (currentConfig.drawStar.roughEdgeSize === undefined) currentConfig.drawStar.roughEdgeSize = 0.1;
                    
                    // 五角星做旧强度最低值为 1200
                    const baseIntensity = currentConfig.drawStar.agingIntensity ?? 50;
                    currentConfig.drawStar.agingIntensity = Math.max(1200, baseIntensity);
                    
                    if (currentConfig.drawStar.agingNoiseSize === undefined) currentConfig.drawStar.agingNoiseSize = 0.15;
                }

                // 确保公司名称在批处理中开启做旧效果并具有最大 1300 的随机强度
                if (currentConfig.companyList) {
                    currentConfig.companyList.forEach(company => {
                        company.drawAging = true;
                        // 随机在 100 - 1300 之间，最高不超过 1300
                        company.agingIntensity = Math.floor(Math.random() * 1200) + 100;
                        if (company.agingNoiseSize === undefined) company.agingNoiseSize = 0.15;
                    });
                }
                if (currentConfig.stampTypeList) {
                    currentConfig.stampTypeList.forEach(type => {
                        if (type.drawAging) {
                            if (type.agingIntensity === undefined) type.agingIntensity = 50;
                            if (type.agingNoiseSize === undefined) type.agingNoiseSize = 0.15;
                        }
                    });
                }

                // 确保全局做旧效果开启
                if (currentConfig.agingEffect) {
                    currentConfig.agingEffect.applyAging = true;
                }

                utils.setDrawConfigs(currentConfig);

                // 4. 强制刷新防伪纹路、做旧效果和毛边效果，生成全新的随机质感
                // refreshStamp(refreshSecurityPattern = true, refreshOld = true, refreshRoughEdge = true)
                utils.refreshStamp(true, true, true);

                // 5. 导出为白底 JPEG 格式的 base64 字符串
                return await utils.exportStampAsDataURL('jpeg', 0.95);
            }, matched.config, i);

            if (!base64Data) {
                console.error(` ❌ 导出图片 ${i} 失败`);
                continue;
            }

            // 7. 保存到本地文件
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
            const filePath = path.join(targetDir, `${i}.jpg`);
            fs.writeFileSync(filePath, buffer);
            console.log(`    -> 已生成: ${path.relative(rootDir, filePath)}`);
        }
        console.log(`✅ [${companyName}] 的 ${generateCount} 张印章已全部写入: ${path.relative(rootDir, targetDir)}`);
    }

    // 8. 清理工作空间并安全关闭
    console.log('\n====== 🧹 正在清理和关闭环境 ======');
    await browser.close();
    await server.close();
    console.log('🎉 批量印章生成任务圆满结束！');
}

main().catch(err => {
    console.error('❌ 执行批量生成时发生未捕获异常:', err);
    process.exit(1);
});
