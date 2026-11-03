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

// 获取输出目录名（直接以企业名称作为目录）
function getOutputDir(baseName) {
    if (!fs.existsSync(outputBaseDir)) {
        fs.mkdirSync(outputBaseDir, { recursive: true });
    }
    return path.join(outputBaseDir, baseName);
}

async function main() {
    console.log('====== 📥 开始解析数据与加载模板 ======');

    const excelPath = path.join(customeDir, 'company.xlsx');
    const templateJsonDir = path.join(customeDir, 'json');
    const generalJsonPath = path.join(customeDir, 'general.json');

    const companies = [];

    // 1. 读取 Excel 公司列表（纯读取，不做任何自动修改和重写）
    if (fs.existsSync(excelPath)) {
        try {
            const workbook = XLSX.readFile(excelPath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            let dataStartIdx = 0;
            if (rawRows.length > 0) {
                const firstCell = String(rawRows[0][0] || '').trim();
                const headerKeywords = ['company', '公司名称', '公司', '企业名称', '名称', 'name', '企业', 'a列'];
                if (headerKeywords.includes(firstCell.toLowerCase())) {
                    dataStartIdx = 1;
                }
            }

            for (let i = dataStartIdx; i < rawRows.length; i++) {
                const row = rawRows[i];
                if (!row || row.length === 0) continue;
                const name = String(row[0] || '').trim();
                if (!name) continue;

                let count = 1;
                if (row.length > 1) {
                    const val = parseInt(row[1], 10);
                    if (!isNaN(val) && val > 0) {
                        count = val;
                    }
                }
                companies.push({ name, count });
            }
        } catch (err) {
            console.warn('⚠️ 读取 Excel 文件失败:', err.message);
        }
    }

    // 若 Excel 未配置或不存在，自动从 json 目录中直接发现企业配置文件
    if (companies.length === 0 && fs.existsSync(templateJsonDir)) {
        const jsonFiles = fs.readdirSync(templateJsonDir).filter(f => f.endsWith('.json') && f !== 'general.json');
        for (const file of jsonFiles) {
            const name = path.basename(file, '.json');
            companies.push({ name, count: 1 });
        }
    }

    if (companies.length === 0) {
        console.error('❌ 未找到待生成的企业名单。请在 custome/company.xlsx 中配置企业名单，或在 custome/json/ 下放置 json 配置文件。');
        process.exit(1);
    }

    console.log(`📋 共获取到 ${companies.length} 个目标企业:`);
    console.log(companies.map(c => ` - ${c.name} (生成数量: ${c.count}张)`).join('\n'));

    // 2. 预先加载通用模板配置
    let generalConfig = null;
    if (fs.existsSync(generalJsonPath)) {
        try {
            generalConfig = JSON.parse(fs.readFileSync(generalJsonPath, 'utf8'));
            console.log(`📂 已成功加载通用印章模板 [general.json]。`);
        } catch (err) {
            console.error(`❌ 解析通用模板 [general.json] 失败:`, err.message);
        }
    } else {
        console.warn(`⚠️ 未找到通用模板 [general.json]。`);
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
        const targetDir = getOutputDir(companyName);

        let configToUse = null;
        let isFallback = false;

        // 尝试匹配以企业名称命名的专属 JSON 文件（优先查找 custome/json/，其次查找 custome/ 根目录）
        let customJsonPath = path.join(templateJsonDir, `${companyName}.json`);
        if (!fs.existsSync(customJsonPath)) {
            const rootCustomJsonPath = path.join(customeDir, `${companyName}.json`);
            if (fs.existsSync(rootCustomJsonPath)) {
                customJsonPath = rootCustomJsonPath;
            }
        }
        if (fs.existsSync(customJsonPath)) {
            try {
                configToUse = JSON.parse(fs.readFileSync(customJsonPath, 'utf8'));
            } catch (err) {
                console.warn(`⚠️ 读取或解析企业专属配置失败: ${path.basename(customJsonPath)}, 错误:`, err.message);
            }
        }

        // 如果没有专属配置文件，回退使用通用 general.json 配置
        if (!configToUse) {
            if (generalConfig) {
                configToUse = JSON.parse(JSON.stringify(generalConfig));
                isFallback = true;
            } else {
                console.warn(`⚠️ [${companyName}] 未找到匹配的专属模板，且系统缺乏通用模板 [general.json]，跳过生成。`);
                continue;
            }
        }

        if (isFallback) {
            console.log(`✨ [${companyName}] 未找到专属模板，回退使用通用模板 [general.json] 进行生成...`);
            // 回退通用模板时，将公司名替换为当前公司
            if (configToUse.company && configToUse.company.companyName) {
                configToUse.company.companyName = companyName;
            }
            if (configToUse.companyList) {
                configToUse.companyList.forEach(company => {
                    company.companyName = companyName;
                });
            }

            // 动态计算公司名称分布因素（textDistributionFactor），使总弧度在不同字数下均保持在公章标准弧度（约 230°）
            const charCount = companyName.length;
            const dynamicFactor = Number((charCount / 3.12).toFixed(2));
            if (configToUse.company) {
                configToUse.company.textDistributionFactor = dynamicFactor;
            }
            if (configToUse.companyList) {
                configToUse.companyList.forEach(company => {
                    company.textDistributionFactor = dynamicFactor;
                });
            }
        } else {
            console.log(`✨ [${companyName}] 匹配到专属配置文件 [${path.basename(customJsonPath)}]，按 JSON 配置开始生成 ${generateCount} 张印章...`);
        }

        // 确保目标输出目录存在
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        for (let i = 1; i <= generateCount; i++) {
            // 直接在浏览器中按照 json 配置文件渲染印章，去除所有系统额外的篡改和随机化处理
            const base64Data = await page.evaluate(async (configObj) => {
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
                
                // 3. 直接应用 JSON 配置，不添加任何系统额外的强制开启/关闭或随机化覆盖
                const currentConfig = JSON.parse(JSON.stringify(configObj));
                utils.setDrawConfigs(currentConfig);

                // 4. 刷新印章（完全根据 JSON 配置项中的实际开关状态刷新）
                const refreshSecurity = !!(currentConfig.securityPattern && currentConfig.securityPattern.openSecurityPattern);
                const refreshOld = !!(currentConfig.agingEffect && currentConfig.agingEffect.applyAging);
                const refreshRoughEdge = !!(currentConfig.roughEdge && currentConfig.roughEdge.drawRoughEdge);
                utils.refreshStamp(refreshSecurity, refreshOld, refreshRoughEdge);

                // 5. 导出为白底 JPEG 格式的 base64 字符串
                return await utils.exportStampAsDataURL('jpeg', 0.95);
            }, configToUse);

            if (!base64Data) {
                console.error(` ❌ 导出图片 ${i} 失败`);
                continue;
            }

            // 保存到本地文件
            const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
            const filePath = path.join(targetDir, `${i}.jpg`);
            fs.writeFileSync(filePath, buffer);
            console.log(`    -> 已生成: ${path.relative(rootDir, filePath)}`);
        }
        console.log(`✅ [${companyName}] 的 ${generateCount} 张印章已全部写入: ${path.relative(rootDir, targetDir)}`);
    }

    // 7. 清理工作空间并安全关闭
    console.log('\n====== 🧹 正在清理和关闭环境 ======');
    await browser.close();
    await server.close();
    console.log('🎉 批量印章生成任务圆满结束！');
}

main().catch(err => {
    console.error('❌ 执行批量生成时发生未捕获异常:', err);
    process.exit(1);
});
