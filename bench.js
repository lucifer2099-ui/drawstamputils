console.log("Starting benchmark script...");
import { performance } from 'perf_hooks';

class OriginalDrawImageCanvas {
  constructor(width, height) {
      this.imageCanvas = { width, height };
      this.imageCtx = { clearRect: () => {}, drawImage: () => {} };
  }
  async drawImage(svgContent, x, y, width, height) {
      this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
      const doc = {
        querySelector: () => ({
          hasAttribute: () => false,
          setAttribute: () => {}
        })
      };

      const svgString = "<svg>...</svg>";
      const bytes = new TextEncoder().encode(svgString);
      const base64Data = btoa(String.fromCharCode(...bytes));
      const base64Url = `data:image/svg+xml;base64,${base64Data}`;
      const img = { onload: null, onerror: null, src: null };

      // Simulate image load
      await new Promise(resolve => resolve());

      this.imageCtx.drawImage(img, x, y, width, height);
      return this.imageCanvas;
  }
}

class OptimizedDrawImageCanvas {
  constructor(width, height) {
      this.imageCanvas = { width, height };
      this.imageCtx = { clearRect: () => {}, drawImage: () => {} };
      this.imageCache = new Map();
  }
  async drawImage(svgContent, x, y, width, height) {
      this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
      const cacheKey = `${svgContent}_${width}_${height}`;
      let img = this.imageCache.get(cacheKey);

      if (!img) {
          const doc = {
            querySelector: () => ({
              hasAttribute: () => false,
              setAttribute: () => {}
            })
          };
          const svgString = "<svg>...</svg>";
          const bytes = new TextEncoder().encode(svgString);
          const base64Data = btoa(String.fromCharCode(...bytes));
          const base64Url = `data:image/svg+xml;base64,${base64Data}`;
          img = { onload: null, onerror: null, src: null };

          await new Promise(resolve => resolve());

          this.imageCache.set(cacheKey, img);
      }

      this.imageCtx.drawImage(img, x, y, width, height);
      return this.imageCanvas;
  }
}

async function runBench() {
  const canvas = new OriginalDrawImageCanvas(1000, 1000);
  const optimizedCanvas = new OptimizedDrawImageCanvas(1000, 1000);

  const svgContent = `<svg>...</svg>`;
  const ITERATIONS = 10000;

  for (let i = 0; i < 10; i++) {
    await canvas.drawImage(svgContent, 0, 0, 100, 100);
    await optimizedCanvas.drawImage(svgContent, 0, 0, 100, 100);
  }

  console.log("Running original...");
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await canvas.drawImage(svgContent, 0, 0, 100, 100);
  }
  const end = performance.now();

  console.log("Running optimized...");
  const startOpt = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await optimizedCanvas.drawImage(svgContent, 0, 0, 100, 100);
  }
  const endOpt = performance.now();

  console.log(`Original Time for ${ITERATIONS} iterations: ${end - start}ms`);
  console.log(`Optimized Time for ${ITERATIONS} iterations: ${endOpt - startOpt}ms`);
}

runBench().catch(console.error);
