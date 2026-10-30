import { performance } from 'perf_hooks';

// Simulate the queryLocalFonts behavior
global.window = {
    queryLocalFonts: async () => {
        // simulate delay (queryLocalFonts can take a few ms)
        await new Promise(r => setTimeout(r, 10));
        return Array.from({ length: 150 }, (_, i) => ({ family: `SysFont${i}` }));
    }
};

const chineseFonts = [
    'SimSun', 'SimHei', 'KaiTi_GB2312', 'FangSong_GB2312', 'SimLi', 'NSimSun',
    'Microsoft YaHei', 'KaiTi', 'FangSong', 'LiSu', 'YouYuan',
    'STHeiti', 'STKaiti', 'STSong', 'STFangsong', 'STZhongsong', 'STXihei', 'STHupo', 'STLiti', 'STXingkai', 'STXinwei', 'STCaiyun',
    'FZZhuan', 'HYZhuan', 'STZhuan', 'ZhuanShu',
    'FZShuTi', 'FZYaoti', 'FZHei-B01S', 'FZKai-Z03S', 'FZSong',
    'PMingLiU', 'MingLiU', 'DFKai-SB', 'BiauKai', 'Microsoft JhengHei', 'Microsoft JhengHei UI', 'Microsoft YaHei UI', 'STSongti-SC-Regular', 'STHeiti-SC-Regular', 'STKaiti-SC-Regular', 'STFangsong-SC-Regular', 'Songti SC', 'Kaiti SC', 'Heiti SC', 'STSongti-SC-Light', 'STHeiti-SC-Light', 'STKaiti-SC-Light', 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'WenQuanYi Zen Hei', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Source Han Serif SC', 'DengXian', 'DengXian Light', 'Microsoft YaHei Light', 'Microsoft YaHei Bold', 'SimSun-ExtB'
];

async function getSystemFontsUncached() {
    try {
        if (global.window.queryLocalFonts) {
            const availableFonts = await global.window.queryLocalFonts();
            const systemFonts = Array.from(new Set(availableFonts.map(font => String(font.family))));
            const allFonts = Array.from(new Set([...chineseFonts, ...systemFonts]));
            return allFonts.sort();
        }
    } catch (error) {
        return chineseFonts;
    }
}

let _cachedFonts = null;
let _fontPromise = null;
async function getSystemFontsCached() {
    if (_cachedFonts) return _cachedFonts;
    if (_fontPromise) return _fontPromise;

    _fontPromise = (async () => {
        try {
            if (global.window.queryLocalFonts) {
                const availableFonts = await global.window.queryLocalFonts();
                const systemFonts = Array.from(new Set(availableFonts.map(font => String(font.family))));
                const allFonts = Array.from(new Set([...chineseFonts, ...systemFonts]));
                _cachedFonts = allFonts.sort();
                return _cachedFonts;
            }
        } catch (error) {
            return chineseFonts;
        }
    })();
    return _fontPromise;
}


async function run() {
    console.log("Uncached...");
    let start = performance.now();
    for (let i = 0; i < 20; i++) {
        await getSystemFontsUncached();
    }
    let end = performance.now();
    console.log(`Uncached total time (20 calls): ${(end - start).toFixed(2)}ms`);

    console.log("Cached...");
    start = performance.now();
    for (let i = 0; i < 20; i++) {
        await getSystemFontsCached();
    }
    end = performance.now();
    console.log(`Cached total time (20 calls): ${(end - start).toFixed(2)}ms`);
}

run();
