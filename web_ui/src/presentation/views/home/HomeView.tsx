import type { HomeTab } from '../../../shared/types/app';
import type { EventCard, QuickTabItem, TabDescriptionMap } from '../../../shared/types/content';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import { Button } from '../../components/Button/Button';
import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';

interface HomeViewProps {
  activeTab: HomeTab;
  profileName: string;
  providerLabel: string;
  notices: string[];
  events: EventCard[];
  tabItems: QuickTabItem[];
  tabDescriptions: TabDescriptionMap;
  onChangeTab: (tab: HomeTab) => void;
  onLogout: () => void;
}

export function HomeView({
  activeTab,
  profileName,
  providerLabel,
  notices,
  events,
  tabItems,
  tabDescriptions,
  onChangeTab,
  onLogout,
}: HomeViewProps) {
  return (
    <PhoneViewport footer={<BottomNav items={tabItems} activeTab={activeTab} onChange={onChangeTab} />}>
      <div className="screen-content home-screen">
        <div className="home-topbar">
          <div className="brand-inline">
            <div className="brand-mark">n</div>
            <div>
              <strong>NURIM OS</strong>
              <small>Home main</small>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onLogout}>
            로그아웃
          </button>
        </div>

        <div className="hero-banner">
          <div className="hero-banner__label">서비스 로고</div>
          <h1>{profileName || '회원'}님, 반갑습니다</h1>
          <p>{tabDescriptions[activeTab]}</p>
        </div>

        <div className="section-card">
          <div className="section-card__title">알림</div>
          <ul className="simple-list">
            {notices.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="section-card">
          <div className="section-card__title">My Page</div>
          <p>{providerLabel} 로그인 상태와 회원 프로필을 요약해서 보여주는 영역입니다.</p>
          <Button variant="secondary">마이페이지 이동</Button>
        </div>

        {events.map((card) => (
          <div key={card.title} className="event-card">
            <strong>{card.title}</strong>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </PhoneViewport>
  );
}
