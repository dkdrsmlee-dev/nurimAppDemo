import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { SplashView } from '../../../presentation/views/splash/SplashView';
import { useAppContext } from '../../../state/app/useAppContext';

export function SplashScreen() {
  const navigate = useNavigate();
  const { bootReady, onboardingSeen, token } = useAppContext();

  useEffect(() => {
    if (!bootReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (token) {
        navigate('/home', { replace: true });
        return;
      }

      navigate(onboardingSeen ? '/auth/start' : '/onboarding', { replace: true });
    }, 1300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [bootReady, navigate, onboardingSeen, token]);

  return <SplashView bootReady={bootReady} />;
}
