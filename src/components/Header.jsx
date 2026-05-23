import CategoryTabs from './CategoryTabs.jsx';

function todayLabel() {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const suffix = (n) => {
    if (n >= 11 && n <= 13) return 'th';
    const last = n % 10;
    return last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
  };
  return `${months[d.getMonth()]} ${d.getDate()}${suffix(d.getDate())}`;
}

export default function Header({ selectedCategory, onCategoryChange, onBack }) {
  return (
    <div className="app-header">
      <div className="brand-row">
        {onBack && (
          <button className="header-back-btn" onClick={onBack} aria-label="뒤로">
            ←
          </button>
        )}
        <span className="brand-script">my</span>
        <span className="brand-name">비밀고백</span>
        <span className="brand-date">{todayLabel()}</span>
      </div>
      <CategoryTabs
        selected={selectedCategory}
        onChange={onCategoryChange}
      />
    </div>
  );
}
