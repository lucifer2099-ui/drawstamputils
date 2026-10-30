import { Canvas } from 'canvas';
// Mock enough of DrawStampUtils if needed, or just benchmark the snippet.
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
      const chars = line.split('');
      const charWidths = chars.map((char) => ctx.measureText(char).width);
      const totalWidth = charWidths.reduce((sum, width) => sum + width, 0) + (chars.length - 1) * letterSpacing * mmToPixel;

      let currentX = -totalWidth / 2;
      chars.forEach((char, index) => {
        currentX += charWidths[index] + letterSpacing * mmToPixel;
      });
    });
  }
  const end = performance.now();
  console.log(`Baseline: ${end - start} ms`);
}

benchmark();
