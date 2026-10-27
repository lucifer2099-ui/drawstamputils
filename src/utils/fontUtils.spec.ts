import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSystemFonts, getFontDisplayName } from './fontUtils';

describe('fontUtils', () => {
  describe('getSystemFonts', () => {
    let originalQueryLocalFonts: any;

    beforeEach(() => {
      // Save original window object if it exists or mock it
      if (typeof window !== 'undefined') {
        originalQueryLocalFonts = (window as any).queryLocalFonts;
      } else {
        (global as any).window = {};
      }
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore window.queryLocalFonts
      if (typeof window !== 'undefined') {
        (window as any).queryLocalFonts = originalQueryLocalFonts;
      } else {
        delete (global as any).window;
      }
      vi.restoreAllMocks();
    });

    it('should return combined sorted fonts when window.queryLocalFonts succeeds', async () => {
      const mockSystemFonts = [
        { family: 'Arial' },
        { family: 'CustomFont' }
      ];
      (window as any).queryLocalFonts = vi.fn().mockResolvedValue(mockSystemFonts);

      const fonts = await getSystemFonts();

      expect(fonts).toContain('CustomFont');
      expect(fonts).toContain('SimSun'); // from chineseFonts
      expect(fonts).toContain('Arial');
      // Verify it's sorted (comparing adjacent elements)
      const isSorted = fonts.every((val, i, arr) => !i || val >= arr[i - 1]);
      expect(isSorted).toBe(true);
    });

    it('should return fallback list when window.queryLocalFonts is undefined', async () => {
      (window as any).queryLocalFonts = undefined;

      const fonts = await getSystemFonts();

      // Check for some chinese fonts
      expect(fonts).toContain('SimSun');
      expect(fonts).toContain('Microsoft YaHei');

      // Check for english fonts added in the undefined branch
      expect(fonts).toContain('Arial');
      expect(fonts).toContain('Impact');
      expect(fonts).toContain('Franklin Gothic Medium');

      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return fallback fonts and log error when window.queryLocalFonts throws an error', async () => {
      const mockError = new Error('Query local fonts failed');
      (window as any).queryLocalFonts = vi.fn().mockRejectedValue(mockError);

      const fonts = await getSystemFonts();

      expect(console.error).toHaveBeenCalledWith('获取系统字体失败:', mockError);
      expect(fonts).toEqual([
        'SimSun',
        'SimHei',
        'KaiTi_GB2312',
        'FangSong_GB2312',
        'Microsoft YaHei',
        'KaiTi',
        'FangSong',
        'STHeiti',
        'STKaiti',
        'STSong',
        'Arial',
        'Times New Roman',
        'Helvetica'
      ]);
    });
  });

  describe('getFontDisplayName', () => {
    it('should return mapped name for known fonts', () => {
      expect(getFontDisplayName('SimSun')).toBe('宋体 (GB2312)');
      expect(getFontDisplayName('Microsoft YaHei')).toBe('微软雅黑');
    });

    it('should return original name for unknown fonts', () => {
      expect(getFontDisplayName('UnknownFont123')).toBe('UnknownFont123');
    });

    it('should handle edge cases like empty string or whitespace', () => {
      expect(getFontDisplayName('')).toBe('');
      expect(getFontDisplayName(' ')).toBe(' ');
    });
  });
});
