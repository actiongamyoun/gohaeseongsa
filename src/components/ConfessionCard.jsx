import { CATEGORY_MAP, REACTIONS } from '../lib/constants.js';
import { timeAgo } from '../lib/time.js';

export default function ConfessionCard({ confession }) {
  const cat = CATEGORY_MAP[confession.category] || { emoji: '🤷', label: '기타' };

  return (
    <div className="diary-card">
      <div className="card-meta">
        <span className="card-category">
          {cat.emoji} {cat.label}
        </span>
        <span className="card-time">{timeAgo(confession.created_at)}</span>
      </div>

      <div className="card-content">{confession.content}</div>

      {confession.ai_response && (
        <div className="ai-response">
          <span className="ai-label">from Claude</span>
          {confession.ai_response}
        </div>
      )}

      <div className="card-reactions">
        {REACTIONS.map((r) => {
          const count = confession[`${r.key}_count`] || 0;
          return (
            <div key={r.key} className={`reaction ${count > 0 ? 'active' : ''}`}>
              <span className="reaction-emoji">{r.emoji}</span>
              <span>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
