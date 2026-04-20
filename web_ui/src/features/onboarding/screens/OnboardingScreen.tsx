import { useNavigate } from 'react-router-dom';

import { onboardingSlides } from '../../../presentation/fixtures/appContent';
import { OnboardingView } from '../../../presentation/views/onboarding/OnboardingView';
import { useAppContext } from '../../../state/app/useAppContext';

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { markOnboardingSeen } = useAppContext();

  const handleComplete = () => {
    markOnboardingSeen();
    navigate('/auth/start');
  };

  return <OnboardingView slides={onboardingSlides} onComplete={handleComplete} />;
}
