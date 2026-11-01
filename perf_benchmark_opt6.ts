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
      const chars = Array.from(line)
      let charsTotalWidth = 0;
      const charWidths = new Array(chars.length);
      for (let j = 0; j < chars.length; j++) {
        const w = ctx.measureText(chars[j]).width;
        charWidths[j] = w;
        charsTotalWidth += w;
      }
      const totalWidth = charsTotalWidth + (chars.length - 1) * letterSpacing * mmToPixel;

      let currentX = -totalWidth / 2;
      for (let j = 0; j < chars.length; j++) {
        currentX += charWidths[j] + letterSpacing * mmToPixel;
      }
    });
  }
  const end = performance.now();
  console.log(`Optimized 6: ${end - start} ms`);
}

benchmark();
