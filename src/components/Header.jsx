import CategoryTabs from './CategoryTabs.jsx';
import { IconUser, IconBack } from './icons.jsx';

export default function Header({ selectedCategory, onCategoryChange, onBack, onMyPage }) {
  return (
    <div className="app-header">
      <div className="brand-row">
        {onBack && (
          <button className="header-back-btn" onClick={onBack} aria-label="뒤로">
            <IconBack />
          </button>
        )}
        <span className="brand-name">Secret Diary</span>

        {onMyPage && (
          <button className="header-right-btn" onClick={onMyPage} aria-label="내 이야기">
            <IconUser />
          </button>
        )}
      </div>
      <CategoryTabs
        selected={selectedCategory}
        onChange={onCategoryChange}
      />
    </div>
  );
}
