/**
 * Median Status Badge Component
 * Displays circular indicator showing if value is above/below/at median
 */

import { TrendingUp, Minus, TrendingDown } from 'lucide-react';

export default function MedianBadge({ value, median }) {
  let badgeClass, Icon, label;

  if (value > median) {
    badgeClass = 'badge-above';
    Icon = TrendingUp;
    label = 'Above';
  } else if (value === median) {
    badgeClass = 'badge-at';
    Icon = Minus;
    label = 'At';
  } else {
    badgeClass = 'badge-below';
    Icon = TrendingDown;
    label = 'Below';
  }

  return (
    <div className="badge-container">
      <div className={badgeClass}>
        <Icon size={18} />
      </div>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-xs text-gray-500">Median: €{median.toLocaleString()}</p>
    </div>
  );
}

