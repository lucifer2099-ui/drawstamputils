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
      let charsTotalWidth = 0;
      const charWidths = new Array(line.length);
      for (let j = 0; j < line.length; j++) {
        const w = ctx.measureText(line[j]).width;
        charWidths[j] = w;
        charsTotalWidth += w;
      }
      const totalWidth = charsTotalWidth + (line.length - 1) * letterSpacing * mmToPixel;

      let currentX = -totalWidth / 2;
      for (let j = 0; j < line.length; j++) {
        // simulation
        currentX += charWidths[j] + letterSpacing * mmToPixel;
      }
    });
  }
  const end = performance.now();
  console.log(`Optimized 3 (no split, map, reduce): ${end - start} ms`);
}

benchmark();
