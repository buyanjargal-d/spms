describe('Validation Utilities', () => {
  describe('Email validation', () => {
    it('should validate correct email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Phone number validation', () => {
    it('should validate Mongolian phone numbers', () => {
      const validPhones = ['99001122', '88001122', '95001122'];

      validPhones.forEach(phone => {
        expect(phone.length).toBe(8);
        expect(/^[89]\d{7}$/.test(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['1234567', '12345678', 'abcdefgh'];

      invalidPhones.forEach(phone => {
        const isValid = /^[89]\d{7}$/.test(phone);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Date validation', () => {
    it('should validate date format', () => {
      const validDates = [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        new Date(),
      ];

      validDates.forEach(date => {
        expect(date instanceof Date).toBe(true);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it('should detect invalid dates', () => {
      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });
  });

  describe('ID validation', () => {
    it('should validate UUID format', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      expect(uuidRegex.test(validUuid)).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const invalidUuid = 'not-a-uuid';

      expect(uuidRegex.test(invalidUuid)).toBe(false);
    });
  });

  describe('String validation', () => {
    it('should trim whitespace', () => {
      const input = '  test  ';
      expect(input.trim()).toBe('test');
    });

    it('should check minimum length', () => {
      const minLength = 3;
      expect('ab'.length >= minLength).toBe(false);
      expect('abc'.length >= minLength).toBe(true);
    });

    it('should check maximum length', () => {
      const maxLength = 10;
      expect('short'.length <= maxLength).toBe(true);
      expect('this is too long'.length <= maxLength).toBe(false);
    });
  });
});
