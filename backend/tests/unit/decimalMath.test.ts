import { DecimalMath } from '../../src/utils/decimalMath';

describe('DecimalMath Utility - Financial Precision', () => {
  it('should accurately add decimals without standard floating point rounding bugs (0.1 + 0.2)', () => {
    // In standard Javascript: 0.1 + 0.2 === 0.30000000000000004
    const result = DecimalMath.add(0.1, 0.2);
    expect(result).toBe(0.3);
  });

  it('should accurately subtract decimals (0.3 - 0.1)', () => {
    const result = DecimalMath.subtract(0.3, 0.1);
    expect(result).toBe(0.2);
  });

  it('should accurately calculate percentage with zero division safety', () => {
    expect(DecimalMath.percentage(50, 200)).toBe(25);
    expect(DecimalMath.percentage(50, 0)).toBe(0);
    expect(DecimalMath.percentage(1, 3)).toBe(33.33);
  });

  it('should format money correctly with ISO currency codes', () => {
    const formattedUSD = DecimalMath.formatMoney(1234.56, 'USD');
    expect(formattedUSD).toContain('1,234.56');
  });
});
