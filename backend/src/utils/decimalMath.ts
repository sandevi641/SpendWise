import Decimal from 'decimal.js';

// Configure Decimal.js precision for financial operations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export class DecimalMath {
  static add(a: number | string | Decimal, b: number | string | Decimal): number {
    return new Decimal(a).plus(new Decimal(b)).toNumber();
  }

  static subtract(a: number | string | Decimal, b: number | string | Decimal): number {
    return new Decimal(a).minus(new Decimal(b)).toNumber();
  }

  static multiply(a: number | string | Decimal, b: number | string | Decimal): number {
    return new Decimal(a).times(new Decimal(b)).toNumber();
  }

  static divide(a: number | string | Decimal, b: number | string | Decimal): number {
    const denom = new Decimal(b);
    if (denom.isZero()) return 0;
    return new Decimal(a).dividedBy(denom).toNumber();
  }

  static round(amount: number | string | Decimal, decimalPlaces = 2): number {
    return new Decimal(amount).toDecimalPlaces(decimalPlaces).toNumber();
  }

  static percentage(part: number | string | Decimal, total: number | string | Decimal): number {
    const tot = new Decimal(total);
    if (tot.isZero()) return 0;
    return new Decimal(part).dividedBy(tot).times(100).toDecimalPlaces(2).toNumber();
  }

  static formatMoney(amount: number | string | Decimal, currency = 'USD'): string {
    const num = new Decimal(amount).toNumber();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
}
