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
  const cache = new Map();
  for (let i = 0; i < 1000; i++) {
    lines.forEach((line, lineIndex) => {
      // Opt
      let totalWidth = 0;
      const charWidths = new Float64Array(line.length);
      for (let j = 0; j < line.length; j++) {
        let char = line[j];
        let w = cache.get(char);
        if (w === undefined) {
           w = ctx.measureText(char).width;
           cache.set(char, w);
        }
        charWidths[j] = w;
        totalWidth += w;
      }
      totalWidth += (line.length - 1) * letterSpacing * mmToPixel;

      let currentX = -totalWidth / 2;
      for (let j = 0; j < line.length; j++) {
        currentX += charWidths[j] + letterSpacing * mmToPixel;
      }
    });
  }
  const end = performance.now();
  console.log(`Optimized 2: ${end - start} ms`);
}

benchmark();
