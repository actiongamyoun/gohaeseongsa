import { CATEGORIES } from '../lib/constants.js';
import { CATEGORY_ICONS } from './icons.jsx';
import { useTranslation } from '../i18n/index.jsx';

export default function CategoryTabs({ selected, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="category-tabs">
      <button
        className={`cat-tab ${selected === 'all' ? 'active' : ''}`}
        onClick={() => onChange('all')}
      >
        {t('categories.all')}
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
            {t(`categories.${cat.key}`)}
          </button>
        );
      })}
    </div>
  );
}
