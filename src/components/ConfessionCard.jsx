import { CATEGORY_MAP, REACTIONS } from '../lib/constants.js';
import { timeAgo } from '../lib/time.js';
import { CATEGORY_ICONS, REACTION_ICONS, IconHeart } from './icons.jsx';

export default function ConfessionCard({ confession }) {
  const cat = CATEGORY_MAP[confession.category] || { label: '기타' };
  const CatIcon = CATEGORY_ICONS[confession.category];

  return (
    <div className="diary-card">
      <div className="card-meta">
        <span className="card-category">
          {CatIcon && <CatIcon />}
          {cat.label}
        </span>
        <span className="card-time">{timeAgo(confession.created_at)}</span>
      </div>

      <div className="card-content">{confession.content}</div>

      {confession.ai_response && (
        <div className="ai-response">
          <div className="ai-label">
            <IconHeart />
            from Claude
          </div>
          <div className="ai-response-text">{confession.ai_response}</div>
        </div>
      )}

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
