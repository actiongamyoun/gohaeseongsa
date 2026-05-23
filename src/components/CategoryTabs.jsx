import { CATEGORIES } from '../lib/constants.js';

export default function CategoryTabs({ selected, onChange }) {
  return (
    <div className="category-tabs">
      <button
        className={`cat-tab ${selected === 'all' ? 'active' : ''}`}
        onClick={() => onChange('all')}
      >
        전체
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          className={`cat-tab ${selected === cat.key ? 'active' : ''}`}
          onClick={() => onChange(cat.key)}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
