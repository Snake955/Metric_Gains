import { formatTime, formatStartTime } from '../workoutFormatters';

describe('ØktTidFormattingTest', () => {
  
  describe('tid', () => {
    it('endrer 0 som 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('endrer til 45 under 60 sekunder', () => {
      expect(formatTime(45)).toBe('00:45');
    });

    it('endrer minutter og sekunder riktig', () => {
      expect(formatTime(125)).toBe('02:05');
    });

    it('endrer lange tider riktig', () => {
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('startTid', () => {
    it('returnerer null string', () => {
      expect(formatStartTime(null)).toBe('');
    });

    it('endrer dato riktig', () => {
      const testDato = new Date('2025-11-27T14:30:00');
      expect(formatStartTime(testDato)).toBe('27.11.2025 kl 14:30');
    });
  });
});