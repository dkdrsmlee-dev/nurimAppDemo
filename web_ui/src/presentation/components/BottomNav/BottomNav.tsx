import type { HomeTab } from '../../../shared/types/app';
import type { QuickTabItem } from '../../../shared/types/content';

interface BottomNavProps {
  items: QuickTabItem[];
  activeTab: HomeTab;
  onChange: (tab: HomeTab) => void;
}

export function BottomNav({ items, activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="main navigation">
      {items.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`bottom-nav__item ${activeTab === tab.key ? 'bottom-nav__item--active' : ''}`.trim()}
          onClick={() => onChange(tab.key)}
        >
          <span className="bottom-nav__icon" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
