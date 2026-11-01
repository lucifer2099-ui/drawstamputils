import { performance } from 'perf_hooks';

function benchmark() {
  const lines = Array(100).fill('Hello World Stamp Text\nSecond Line\nThird Line');
  const letterSpacing = 2;
  const mmToPixel = 3.8;

  const start1 = performance.now();
  for (let i = 0; i < 10000; i++) {
    lines.forEach((line) => {
      const chars = line.split('')
      const charWidths = chars.map((char) => 5)
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
  for (let i = 0; i < 10000; i++) {
    lines.forEach((line) => {
      const chars = line.split('');
      let charsTotalWidth = 0;
      const charWidths = new Array(chars.length);
      for (let j = 0; j < chars.length; j++) {
        charWidths[j] = 5;
        charsTotalWidth += 5;
      }
      const totalWidth = charsTotalWidth + (chars.length - 1) * letterSpacing * mmToPixel;

      let currentX = -totalWidth / 2;
      for (let j = 0; j < chars.length; j++) {
        currentX += charWidths[j] + letterSpacing * mmToPixel;
      }
    });
  }
  const end2 = performance.now();

  console.log(`Baseline string ops: ${end1 - start1} ms`);
  console.log(`Optimized string ops: ${end2 - start2} ms`);
}

benchmark();
