import { Canvas } from 'canvas';
import { createCanvas } from 'canvas';

const ctx = createCanvas(200, 200).getContext('2d');
ctx.font = 'normal 12px sans-serif';

const line = 'Hello World';
const chars = line.split('');
const sumWidth = chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0);
const fullWidth = ctx.measureText(line).width;

console.log(`Sum of chars: ${sumWidth}`);
console.log(`Full width: ${fullWidth}`);
