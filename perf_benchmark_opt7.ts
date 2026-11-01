import { Canvas } from 'canvas';
import { performance } from 'perf_hooks';
import { createCanvas } from 'canvas';

function benchmark() {
  const ctx = createCanvas(200, 200).getContext('2d');
  ctx.font = 'normal 12px sans-serif';

  const lines = Array(100).fill('Hello World Stamp Text\nSecond Line\nThird Line');
  const letterSpacing = 2;
  const mmToPixel = 3.8;

  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    lines.forEach((line, lineIndex) => {
      // Opt
      let totalWidth = 0;
      const charWidths = [];
      const chars = line.split('');
      for (const char of chars) {
        const w = ctx.measureText(char).width;
        charWidths.push(w);
        totalWidth += w;
      }
      totalWidth += (chars.length - 1) * letterSpacing * mmToPixel;

      let currentX = -totalWidth / 2;
      for (let j = 0; j < chars.length; j++) {
        currentX += charWidths[j] + letterSpacing * mmToPixel;
      }
    });
  }
  const end = performance.now();
  console.log(`Optimized 7 (for of chars + push): ${end - start} ms`);
}

benchmark();
