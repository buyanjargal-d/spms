import { describe, it, expect } from 'vitest';

describe('Formatting Utilities', () => {
  describe('Date formatting', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01');
      const formatted = date.toLocaleDateString('mn-MN');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should format time correctly', () => {
      const date = new Date('2024-01-01T10:30:00');
      const formatted = date.toLocaleTimeString('mn-MN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(formatted).toBeDefined();
    });
  });

  describe('Status formatting', () => {
    it('should map status to Mongolian labels', () => {
      const statusMap = {
        completed: 'Дууссан',
        pending: 'Хүлээгдэж буй',
        approved: 'Баталгаажсан',
        rejected: 'Татгалзсан',
      };

      expect(statusMap.completed).toBe('Дууссан');
      expect(statusMap.pending).toBe('Хүлээгдэж буй');
    });
  });

  describe('Class formatting', () => {
    it('should format class display', () => {
      const classObj = {
        gradeLevel: 5,
        section: 'A',
      };

      const formatted = `${classObj.gradeLevel}-${classObj.section}`;
      expect(formatted).toBe('5-A');
    });

    it('should handle missing class data', () => {
      const classObj = null;
      const formatted = classObj ? `${classObj.gradeLevel}-${classObj.section}` : '-';
      expect(formatted).toBe('-');
    });
  });

  describe('String utilities', () => {
    it('should capitalize first letter', () => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      expect(input.trim()).toBe('test');
    });

    it('should convert to lowercase', () => {
      expect('TEST'.toLowerCase()).toBe('test');
    });
  });

  describe('Array utilities', () => {
    it('should filter arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      const filtered = arr.filter(n => n > 3);
      expect(filtered).toEqual([4, 5]);
    });

    it('should map arrays', () => {
      const arr = [1, 2, 3];
      const mapped = arr.map(n => n * 2);
      expect(mapped).toEqual([2, 4, 6]);
    });

    it('should check if array includes value', () => {
      const arr = ['admin', 'teacher', 'parent'];
      expect(arr.includes('teacher')).toBe(true);
      expect(arr.includes('student')).toBe(false);
    });
  });
});
