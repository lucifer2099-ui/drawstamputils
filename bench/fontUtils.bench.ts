import { bench, describe } from 'vitest'
import { getSystemFonts } from '../src/utils/fontUtils'

describe('getSystemFonts', () => {
  bench('getSystemFonts performance', async () => {
    // Mock window.queryLocalFonts for the benchmark
    if (typeof window === 'undefined') {
      (global as any).window = {};
    }

    (window as any).queryLocalFonts = async () => {
      // Simulate getting a list of fonts
      return Array.from({ length: 100 }, (_, i) => ({ family: `SystemFont${i}` }));
    };

    await getSystemFonts();
    await getSystemFonts();
    await getSystemFonts();
    await getSystemFonts();
    await getSystemFonts();
  })
})
