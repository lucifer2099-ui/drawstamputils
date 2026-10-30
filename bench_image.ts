import { performance } from 'perf_hooks';
import { DrawStampUtils } from './src/DrawStampUtils';

// Mock Canvas environment
class MockContext {
    clearRect() {}
    drawImage() {}
    save() {}
    restore() {}
    translate() {}
    rotate() {}
    scale() {}
    setTransform() {}
    beginPath() {}
    closePath() {}
    arc() {}
    stroke() {}
    fill() {}
    moveTo() {}
    lineTo() {}
    clip() {}
}

class MockCanvas {
    width = 1000;
    height = 1000;
    getContext() { return new MockContext(); }
    getBoundingClientRect() { return { left: 0, top: 0, width: 1000, height: 1000 }; }
    addEventListener() {}
    removeEventListener() {}
}

global.document = {
    createElement: (tag) => {
        if (tag === 'canvas') return new MockCanvas();
        return {};
    }
} as any;

global.Image = class {
    onload: any;
    onerror: any;
    src = '';
} as any;

global.createImageBitmap = async (img) => {
    return {} as any;
}

global.requestAnimationFrame = (cb) => {
    setTimeout(cb, 0);
    return 0;
};

async function runBench() {
    const utils = new DrawStampUtils(new MockCanvas() as any);
    const mockCtx = new MockContext() as any;

    utils.refreshStamp = () => {};
    utils['imageCache'].clear();

    const start = performance.now();
    const ITERATIONS = 100;

    const OriginalImage = global.Image;
    global.Image = class {
        onload: any;
        onerror: any;
        src = '';
        constructor() {
            setTimeout(() => {
                if (this.onload) this.onload(new Event('load'));
            }, 2); // Simulating 2ms network/decode delay
        }
    } as any;

    for (let i = 0; i < ITERATIONS; i++) {
        const imageList = Array.from({length: 10}, (_, index) => ({
            imageUrl: `img_${i}_${index}.jpg`,
            imageWidth: 10,
            imageHeight: 10
        }));

        await utils['drawImageList'](mockCtx, imageList as any, 50, 50);
    }
    const end = performance.now();

    console.log(`Time for ${ITERATIONS} iterations with parallel await: ${end - start}ms`);
}

runBench().catch(console.error);
