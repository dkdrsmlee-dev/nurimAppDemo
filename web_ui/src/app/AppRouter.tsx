import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthStartScreen } from '../features/auth/screens/AuthStartScreen';
import { CompleteScreen } from '../features/auth/screens/CompleteScreen';
import { ProfileScreen } from '../features/auth/screens/ProfileScreen';
import { TermsScreen } from '../features/auth/screens/TermsScreen';
import { VerifyScreen } from '../features/auth/screens/VerifyScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { SplashScreen } from '../features/splash/screens/SplashScreen';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/auth/start" element={<AuthStartScreen />} />
      <Route path="/auth/terms" element={<TermsScreen />} />
      <Route path="/auth/verify" element={<VerifyScreen />} />
      <Route path="/auth/profile" element={<ProfileScreen />} />
      <Route path="/auth/complete" element={<CompleteScreen />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
