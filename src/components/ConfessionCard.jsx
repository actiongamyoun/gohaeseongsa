import { CATEGORY_MAP, REACTIONS } from '../lib/constants.js';
import { timeAgo } from '../lib/time.js';
import { CATEGORY_ICONS, REACTION_ICONS } from './icons.jsx';
import { useTranslation } from '../i18n/index.jsx';

export default function ConfessionCard({ confession }) {
  const { t, lang } = useTranslation();
  const cat = CATEGORY_MAP[confession.category] || { key: 'etc' };
  const CatIcon = CATEGORY_ICONS[confession.category];

  return (
    <div className="diary-card">
      <div className="card-meta">
        <span className="card-category">
          {CatIcon && <CatIcon />}
          {t(`categories.${cat.key}`)}
        </span>
        <span className="card-time">{timeAgo(confession.created_at, lang)}</span>
      </div>

      <div className="card-content">{confession.content}</div>

      <div className="card-reactions">
        {REACTIONS.map((r) => {
          const Icon = REACTION_ICONS[r.key];
          const count = confession[`${r.key}_count`] || 0;
          return (
            <button key={r.key} className={`reaction ${count > 0 ? 'active' : ''}`}>
              {Icon && <Icon />}
              <span>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
