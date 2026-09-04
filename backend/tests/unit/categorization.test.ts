import { CategorizationService } from '../../src/services/categorizationService';

describe('CategorizationService - Rule-Based Engine', () => {
  it('should accurately suggest Transportation for Uber rides', () => {
    const result = CategorizationService.suggestCategory('Uber to university campus');
    expect(result.categoryName).toBe('Transportation');
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('should accurately suggest Groceries for supermarket keywords', () => {
    const result = CategorizationService.suggestCategory('Bought rice and vegetables at supermarket');
    expect(result.categoryName).toBe('Groceries');
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('should accurately suggest Food & Dining for restaurant/cafe terms', () => {
    const result = CategorizationService.suggestCategory('Starbucks latte and croissant');
    expect(result.categoryName).toBe('Food & Dining');
  });

  it('should accurately suggest Salary & Wages for income paycheck keywords', () => {
    const result = CategorizationService.suggestCategory('Monthly salary direct deposit', 'INCOME');
    expect(result.categoryName).toBe('Salary & Wages');
  });

  it('should fallback gracefully for unrecognizable descriptions', () => {
    const result = CategorizationService.suggestCategory('xyz random string 123');
    expect(result.categoryName).toBe('General Expense');
    expect(result.confidence).toBe(0);
  });
});
