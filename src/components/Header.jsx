import CategoryTabs from './CategoryTabs.jsx';
import { IconUser, IconBack } from './icons.jsx';
import { useTranslation } from '../i18n/index.jsx';

export default function Header({ selectedCategory, onCategoryChange, onBack, onMyPage }) {
  const { t } = useTranslation();

  return (
    <div className="app-header">
      <div className="brand-row">
        {onBack && (
          <button className="header-back-btn" onClick={onBack} aria-label={t('header.back')}>
            <IconBack />
          </button>
        )}
        <span className="brand-name">{t('brand.name_en')}</span>

        {onMyPage && (
          <button className="header-right-btn" onClick={onMyPage} aria-label={t('header.my_page')}>
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
