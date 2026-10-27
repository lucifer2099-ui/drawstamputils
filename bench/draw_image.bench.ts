import { bench, describe } from 'vitest';
import { DrawImageCanvas } from '../src/utils/DrawImageCanvas';

describe('DrawImageCanvas drawImage', () => {
    const canvas = new DrawImageCanvas(1000, 1000);
    const svgContent = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="red" /></svg>`;

    bench('drawImage with svg', async () => {
        await canvas.drawImage(svgContent, 0, 0, 100, 100);
    });
});
