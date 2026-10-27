import { performance } from 'perf_hooks';
import { DrawImageCanvas } from './src/utils/DrawImageCanvas';
import { JSDOM } from 'jsdom';

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true
});
global.document = dom.window.document as any;
global.window = dom.window as any;
global.Image = dom.window.Image as any;
global.DOMParser = dom.window.DOMParser as any;
global.XMLSerializer = dom.window.XMLSerializer as any;
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.encodeURIComponent = encodeURIComponent;
global.unescape = unescape;
global.TextEncoder = TextEncoder;

// Mock Canvas
class MockCanvas {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  getContext() {
    return {
      clearRect: () => {},
      drawImage: () => {}
    };
  }
}
const originalCreateElement = dom.window.document.createElement.bind(dom.window.document);
document.createElement = ((tag: string) => {
  if (tag === 'canvas') return new MockCanvas(1000, 1000);
  return originalCreateElement(tag);
}) as any;

// Mock Image loading
const originalImage = global.Image;
global.Image = class extends originalImage {
  set src(value: string) {
    super.src = value;
    if (this.onload) setTimeout(() => this.onload!(new Event('load')), 0);
  }
} as any;

async function runBench() {
  const canvas = new DrawImageCanvas(1000, 1000);
  const svgContent = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="red" /></svg>';

  const ITERATIONS = 1000;

  // Warmup
  for (let i = 0; i < 10; i++) {
    await canvas.drawImage(svgContent, 0, 0, 100, 100);
  }

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await canvas.drawImage(svgContent, 0, 0, 100, 100);
  }
  const end = performance.now();

  console.log(`Total time for ${ITERATIONS} iterations: ${end - start}ms`);
  console.log(`Average time per iteration: ${(end - start) / ITERATIONS}ms`);
  process.exit(0);
}

runBench().catch(console.error);
