import { Canvas } from 'canvas';
import { performance } from 'perf_hooks';
import { createCanvas } from 'canvas';

function benchmark() {
  const ctx = createCanvas(200, 200).getContext('2d');
  ctx.font = 'normal 12px sans-serif';

  const lines = Array(100).fill('Hello World Stamp Text\nSecond Line\nThird Line');
  const letterSpacing = 2;
  const mmToPixel = 3.8;

  const start1 = performance.now();
  for (let i = 0; i < 1000; i++) {
    lines.forEach((line) => {
      const chars = line.split('')
      const charWidths = chars.map((char) => ctx.measureText(char).width)
      const totalWidth =
          charWidths.reduce((sum, width) => sum + width, 0) +
          (chars.length - 1) * letterSpacing * mmToPixel
      let currentX = -totalWidth / 2;
      chars.forEach((char, index) => {
        currentX += charWidths[index] + letterSpacing * mmToPixel;
      });
    });
  }
  const end1 = performance.now();

  const start2 = performance.now();
  for (let i = 0; i < 1000; i++) {
    lines.forEach((line) => {
      const chars = line.split('');
      const lineLen = chars.length;

      const charWidths = new Array(lineLen);
      for (let j = 0; j < lineLen; j++) {
        charWidths[j] = ctx.measureText(chars[j]).width;
      }

      const totalWidth = ctx.measureText(line).width + (lineLen - 1) * letterSpacing * mmToPixel;
      let currentX = -totalWidth / 2;

      for (let j = 0; j < lineLen; j++) {
        currentX += charWidths[j] + letterSpacing * mmToPixel;
      }
    });
  }
  const end2 = performance.now();

  console.log(`Baseline with measureText: ${end1 - start1} ms`);
  console.log(`Optimized loops with measureLine: ${end2 - start2} ms`);
}

benchmark();
