/**
 * Shared constants across pages
 */

import { Home, Car, UtensilsCrossed, Zap, Heart, Smile, CreditCard, Phone, Shield, MoreHorizontal, Receipt, Tv } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  'House',
  'Car',
  'Food',
  'Utilities',
  'Healthcare',
  'Leisure',
  'Subscriptions',
  'Phone',
  'Insurance',
  'Other',
];

export const SHARED_EXPENSE_CATEGORIES = [
  'House',
  'Food',
  'Utilities',
  'Insurance',
  'Other',
  'Subscriptions',
  'Taxes',
  'InternetTV',
  'Car',
];

export const PERSONAL_EXPENSE_CATEGORIES = [
  'Car',
  'Healthcare',
  'Leisure',
  'Other',
  'Phone',
  'Subscriptions',
];

export const CHART_COLORS = [
  '#EC4899', // pink
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#EF4444', // red
  '#8B5CF6', // violet
  '#F97316', // orange
];

export const CATEGORY_ICONS = {
  'House': Home,
  'Car': Car,
  'Food': UtensilsCrossed,
  'Utilities': Zap,
  'Healthcare': Heart,
  'Leisure': Smile,
  'Subscriptions': CreditCard,
  'Phone': Phone,
  'Insurance': Shield,
  'Other': MoreHorizontal,
  'Taxes': Receipt,
  'InternetTV': Tv,
};
