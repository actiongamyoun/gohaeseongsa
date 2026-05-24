import { CATEGORIES } from '../lib/constants.js';
import { CATEGORY_ICONS } from './icons.jsx';

export default function CategoryTabs({ selected, onChange }) {
  return (
    <div className="category-tabs">
      <button
        className={`cat-tab ${selected === 'all' ? 'active' : ''}`}
        onClick={() => onChange('all')}
      >
        전체
      </button>
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.key];
        return (
          <button
            key={cat.key}
            className={`cat-tab ${selected === cat.key ? 'active' : ''}`}
            onClick={() => onChange(cat.key)}
          >
            {Icon && <Icon />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
