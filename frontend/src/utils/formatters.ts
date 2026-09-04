export function formatCurrency(amount: number | string | undefined | null, currency = 'USD'): string {
  if (amount === undefined || amount === null) return '$0.00';
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(val)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

export function getCategoryColor(categoryName: string): string {
  const map: Record<string, string> = {
    'Housing & Rent': '#8B5E3C',
    'Food & Dining': '#D97706',
    Groceries: '#059669',
    Transportation: '#2563EB',
    'Utilities & Bills': '#DC2626',
    Entertainment: '#7C3AED',
    Healthcare: '#DB2777',
    'Education & Study': '#4F46E5',
    'Personal Care': '#E11D48',
    Shopping: '#EA580C',
    'Salary & Wages': '#16A34A',
    'Freelance & Projects': '#0D9488',
    'Investments & Dividends': '#0284C7',
  };
  return map[categoryName] || '#6B7280';
}
