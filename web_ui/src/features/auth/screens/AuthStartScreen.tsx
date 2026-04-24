import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthStartView } from '../../../presentation/views/auth/AuthStartView';
import { getActionErrorMessage } from '../../../shared/lib/getActionErrorMessage';
import { fetchLoginConfig } from '../../../shared/lib/loginConfigApi';
import type { SocialProvider } from '../../../shared/types/app';
import { useAppContext } from '../../../state/app/useAppContext';

export function AuthStartScreen() {
  const navigate = useNavigate();
  const { beginSocialLogin } = useAppContext();
  const [loginConfigLoading, setLoginConfigLoading] = useState(true);
  const [loginConfigError, setLoginConfigError] = useState('');
  const [kakaoEnabled, setKakaoEnabled] = useState(false);
  const [naverEnabled, setNaverEnabled] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadLoginConfig = async () => {
    setLoginConfigLoading(true);
    setLoginConfigError('');

    try {
      const loginConfig = await fetchLoginConfig();
      setKakaoEnabled(loginConfig.snsLogin && loginConfig.providers.kakao);
      setNaverEnabled(loginConfig.snsLogin && loginConfig.providers.naver);
    } catch (error) {
      setLoginConfigError(
        getActionErrorMessage(error, '로그인 설정을 불러오지 못했습니다. 다시 시도해 주세요.'),
      );
      setKakaoEnabled(false);
      setNaverEnabled(false);
    } finally {
      setLoginConfigLoading(false);
    }
  };

  useEffect(() => {
    void loadLoginConfig();
  }, []);

  const handleStart = async (provider: SocialProvider) => {
    const providerEnabled = provider === 'kakao' ? kakaoEnabled : naverEnabled;
    if (!providerEnabled) {
      return;
    }

    setPendingProvider(provider);
    setErrorMessage('');

    try {
      const socialLoginResult = await beginSocialLogin(provider);
      navigate(socialLoginResult.nextStep === 'home' ? '/home' : '/auth/terms', {
        replace: socialLoginResult.nextStep === 'home',
      });
    } catch (error) {
      setErrorMessage(getActionErrorMessage(error, '소셜 로그인 연결에 실패했습니다. 다시 시도해 주세요.'));
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <AuthStartView
      loginConfigLoading={loginConfigLoading}
      kakaoEnabled={kakaoEnabled}
      naverEnabled={naverEnabled}
      pendingProvider={pendingProvider}
      errorMessage={errorMessage || loginConfigError}
      onSelectProvider={handleStart}
      onRetryConfig={() => {
        void loadLoginConfig();
      }}
    />
  );
}
