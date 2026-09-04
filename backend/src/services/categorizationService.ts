export interface CategorizationRule {
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
  keywords: string[];
  patterns?: RegExp[];
}

export class CategorizationService {
  private static rules: CategorizationRule[] = [
    // Groceries & Food
    {
      categoryName: 'Groceries',
      type: 'EXPENSE',
      keywords: ['grocery', 'supermarket', 'walmart', 'costco', 'trader joe', 'whole foods', 'carrefour', 'keells', 'cargills', 'vegetable', 'fruit', 'rice', 'milk', 'bread', 'meat', 'spices', 'market'],
      patterns: [/grocer(y|ies)/i, /supermarket/i, /vegetable/i, /cargills/i, /keells/i],
    },
    {
      categoryName: 'Food & Dining',
      type: 'EXPENSE',
      keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'kfc', 'burger king', 'subway', 'pizza', 'domino', 'dine', 'lunch', 'dinner', 'breakfast', 'uber eats', 'doordash', 'grubhub', 'pickme food', 'swiggy', 'zomato', 'food'],
      patterns: [/cafe/i, /restaurant/i, /coffee/i, /pizza/i, /burger/i, /bistro/i, /bakery/i],
    },
    // Transportation
    {
      categoryName: 'Transportation',
      type: 'EXPENSE',
      keywords: ['uber', 'lyft', 'taxi', 'cab', 'pickme', 'grab', 'bus', 'train', 'metro', 'subway fare', 'gas', 'petrol', 'fuel', 'diesel', 'parking', 'toll', 'flight', 'airline', 'transit'],
      patterns: [/uber/i, /lyft/i, /pickme/i, /petrol/i, /fuel/i, /parking/i, /metro/i, /airline/i],
    },
    // Housing & Utilities
    {
      categoryName: 'Housing & Rent',
      type: 'EXPENSE',
      keywords: ['rent', 'landlord', 'mortgage', 'apartment', 'housing', 'lease', 'flat maintenance'],
      patterns: [/\brent\b/i, /mortgage/i, /lease/i],
    },
    {
      categoryName: 'Utilities & Bills',
      type: 'EXPENSE',
      keywords: ['electricity', 'water bill', 'power', 'ceb', 'leco', 'gas bill', 'internet', 'wifi', 'broadband', 'telecom', 'dialog', 'mobitel', 'verizon', 'at&t', 'utility', 'mobile recharge', 'phone bill'],
      patterns: [/electric(ity)?/i, /water bill/i, /internet/i, /broadband/i, /phone bill/i, /telecom/i],
    },
    // Entertainment & Subscriptions
    {
      categoryName: 'Entertainment',
      type: 'EXPENSE',
      keywords: ['netflix', 'spotify', 'youtube', 'disney', 'prime video', 'apple music', 'hulu', 'cinema', 'movie', 'theatre', 'game', 'playstation', 'steam', 'xbox', 'concert', 'club'],
      patterns: [/netflix/i, /spotify/i, /cinema/i, /theatre/i, /steam/i, /subscription/i],
    },
    // Healthcare & Wellness
    {
      categoryName: 'Healthcare',
      type: 'EXPENSE',
      keywords: ['pharmacy', 'medicine', 'hospital', 'clinic', 'doctor', 'dental', 'dentist', 'meds', 'health', 'consultation', 'prescription', 'optician', 'lens'],
      patterns: [/pharmacy/i, /hospital/i, /clinic/i, /doctor/i, /dent(al|ist)/i, /med(icine|s)/i],
    },
    // Education
    {
      categoryName: 'Education & Study',
      type: 'EXPENSE',
      keywords: ['university', 'college', 'tuition', 'course', 'udemy', 'coursera', 'textbook', 'book', 'stationery', 'exam fee', 'campus', 'degree'],
      patterns: [/university/i, /tuition/i, /udemy/i, /coursera/i, /textbook/i, /exam fee/i],
    },
    // Shopping & Personal Care
    {
      categoryName: 'Personal Care',
      type: 'EXPENSE',
      keywords: ['salon', 'barber', 'haircut', 'spa', 'cosmetics', 'skincare', 'shampoo', 'gym', 'fitness', 'workout'],
      patterns: [/haircut/i, /salon/i, /barber/i, /spa/i, /gym/i, /fitness/i],
    },
    {
      categoryName: 'Shopping',
      type: 'EXPENSE',
      keywords: ['amazon', 'ebay', 'aliexpress', 'daraz', 'clothes', 'shoes', 'fashion', 'zara', 'h&m', 'electronics', 'gadget', 'apparel'],
      patterns: [/amazon/i, /daraz/i, /clothing/i, /apparel/i, /electronics/i],
    },
    // Incomes
    {
      categoryName: 'Salary & Wages',
      type: 'INCOME',
      keywords: ['salary', 'paycheck', 'payroll', 'wages', 'stipend', 'monthly pay', 'employer'],
      patterns: [/salary/i, /payroll/i, /paycheck/i, /stipend/i],
    },
    {
      categoryName: 'Freelance & Projects',
      type: 'INCOME',
      keywords: ['freelance', 'client', 'upwork', 'fiverr', 'contract', 'bounty', 'consulting gig', 'design fee'],
      patterns: [/freelance/i, /upwork/i, /fiverr/i, /consulting/i],
    },
    {
      categoryName: 'Investments & Dividends',
      type: 'INCOME',
      keywords: ['dividend', 'interest', 'stocks', 'crypto profit', 'capital gain', 'shares', 'fixed deposit'],
      patterns: [/dividend/i, /interest/i, /capital gain/i],
    },
  ];

  /**
   * Suggests the best matching category name and confidence score given a transaction description.
   */
  static suggestCategory(
    description: string,
    forcedType?: 'INCOME' | 'EXPENSE'
  ): { categoryName: string; confidence: number; matchedKeyword?: string } {
    if (!description || description.trim() === '') {
      return {
        categoryName: forcedType === 'INCOME' ? 'Other Income' : 'General Expense',
        confidence: 0,
      };
    }

    const cleanDesc = description.toLowerCase().trim();
    let bestMatch = {
      categoryName: forcedType === 'INCOME' ? 'Other Income' : 'General Expense',
      confidence: 0,
      matchedKeyword: undefined as string | undefined,
    };

    for (const rule of this.rules) {
      if (forcedType && rule.type !== forcedType) {
        continue;
      }

      // Check regex patterns (high confidence)
      if (rule.patterns) {
        for (const pattern of rule.patterns) {
          if (pattern.test(cleanDesc)) {
            return {
              categoryName: rule.categoryName,
              confidence: 0.95,
              matchedKeyword: pattern.source,
            };
          }
        }
      }

      // Check keywords
      for (const keyword of rule.keywords) {
        if (cleanDesc.includes(keyword.toLowerCase())) {
          const confidence = keyword.length > 5 ? 0.9 : 0.75;
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              categoryName: rule.categoryName,
              confidence,
              matchedKeyword: keyword,
            };
          }
        }
      }
    }

    return bestMatch;
  }
}
