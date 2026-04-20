import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { eventCards, noticeItems, quickTabs, tabDescriptions } from '../../../presentation/fixtures/appContent';
import { HomeView } from '../../../presentation/views/home/HomeView';
import { useAppContext } from '../../../state/app/useAppContext';

export function HomeScreen() {
  const navigate = useNavigate();
  const { activeHomeTab, profile, setActiveHomeTab, token, logout } = useAppContext();

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [navigate, token]);

  const handleLogout = () => {
    void logout()
      .then(() => navigate('/'))
      .catch(() => navigate('/'));
  };

  return (
    <HomeView
      activeTab={activeHomeTab}
      profileName={profile.name}
      providerLabel={profile.providerLabel}
      notices={noticeItems}
      events={eventCards}
      tabItems={quickTabs}
      tabDescriptions={tabDescriptions}
      onChangeTab={setActiveHomeTab}
      onLogout={handleLogout}
    />
  );
}
