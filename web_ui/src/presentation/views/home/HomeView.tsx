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
  const resolvedName = profileName?.trim() ? profileName.trim() : '회원';
  const benefitLabels = ['출석 체크 리워드 혜택', '마이펫 촬영 리워드 혜택'];

  return (
    <PhoneViewport footer={<BottomNav items={tabItems} activeTab={activeTab} onChange={onChangeTab} />}>
      <main className="screen-content home-screen">
        <header className="home-header">
          <button type="button" className="home-brand-button">
            <span className="home-brand-mark" aria-hidden>
              n
            </span>
            <span className="home-brand-text">NURIM OS</span>
          </button>
          <div className="home-header-actions">
            <button type="button" className="home-header-icon" aria-label="알림">
              🔔
            </button>
            <button type="button" className="home-header-icon" aria-label="마이페이지">
              👤
            </button>
          </div>
        </header>

        <section className="home-summary-card">
          <span className="home-summary-card__eyebrow">HOME MAIN</span>
          <h1>{resolvedName}님, 반갑습니다</h1>
          <p>{tabDescriptions[activeTab]}</p>
        </section>

        <section className="home-hero-card" aria-label="이벤트 메인 배너">
          <div className="home-hero-card__media" />
          <div className="home-carousel-dots" aria-hidden>
            <span className="home-carousel-dots__item home-carousel-dots__item--active" />
            <span className="home-carousel-dots__item" />
            <span className="home-carousel-dots__item" />
          </div>
        </section>

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
          <div className="home-card-actions">
            <Button variant="secondary">마이페이지 이동</Button>
            <Button variant="ghost" onClick={onLogout}>
              로그아웃
            </Button>
          </div>
        </div>

        {events.map((card, index) => (
          <article key={card.title} className="home-benefit-card">
            <div className="home-benefit-card__content">
              <span className="home-benefit-card__eyebrow">{benefitLabels[index] ?? '이벤트 혜택'}</span>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
              <div className="home-carousel-dots" aria-hidden>
                <span className="home-carousel-dots__item home-carousel-dots__item--active" />
                <span className="home-carousel-dots__item" />
              </div>
            </div>
            <div className="home-benefit-card__thumb" aria-hidden>
              ICON
            </div>
          </article>
        ))}
      </main>
    </PhoneViewport>
  );
}
