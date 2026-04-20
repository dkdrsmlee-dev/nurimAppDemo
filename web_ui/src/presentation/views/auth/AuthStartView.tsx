import type { SocialProvider } from '../../../shared/types/app';
import { ActionError } from '../../components/ActionError/ActionError';
import { Button } from '../../components/Button/Button';
import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';

interface AuthStartViewProps {
  loginConfigLoading: boolean;
  kakaoEnabled: boolean;
  naverEnabled: boolean;
  pendingProvider: SocialProvider | null;
  errorMessage: string;
  onSelectProvider: (provider: SocialProvider) => void;
  onRetryConfig: () => void;
}

export function AuthStartView({
  loginConfigLoading,
  kakaoEnabled,
  naverEnabled,
  pendingProvider,
  errorMessage,
  onSelectProvider,
  onRetryConfig,
}: AuthStartViewProps) {
  const hasEnabledProviders = kakaoEnabled || naverEnabled;

  return (
    <PhoneViewport>
      <div className="screen-content auth-start-screen">
        <div className="page-header">
          <span className="page-header__back">‹</span>
          <span>서비스 시작하기</span>
        </div>
        <div className="brand-panel">
          <div className="brand-mark">n</div>
          <div>
            <h1>NURIM OS</h1>
            <p>간편하게 가입하고 혜택을 바로 시작하세요.</p>
          </div>
        </div>
        {loginConfigLoading ? <p className="helper-text">사용 가능한 로그인 수단을 확인하고 있습니다.</p> : null}
        {!loginConfigLoading && hasEnabledProviders ? (
          <div className="login-stack">
            {kakaoEnabled ? (
              <Button
                className="button--kakao"
                disabled={pendingProvider !== null}
                onClick={() => onSelectProvider('kakao')}
              >
                {pendingProvider === 'kakao' ? '카카오 계정 확인 중...' : '카카오로 시작하기'}
              </Button>
            ) : null}
            {naverEnabled ? (
              <Button
                className="button--naver"
                disabled={pendingProvider !== null}
                onClick={() => onSelectProvider('naver')}
              >
                {pendingProvider === 'naver' ? '네이버 계정 확인 중...' : '네이버로 시작하기'}
              </Button>
            ) : null}
          </div>
        ) : null}
        {!loginConfigLoading && !hasEnabledProviders ? (
          <ActionError message="현재 제공되는 로그인 수단이 없습니다. 잠시 후 다시 확인해 주세요." />
        ) : null}
        {errorMessage ? <ActionError message={errorMessage} /> : null}
        {!loginConfigLoading && errorMessage ? (
          <Button disabled={pendingProvider !== null} onClick={onRetryConfig}>
            다시 불러오기
          </Button>
        ) : null}
        <ul className="helper-list">
          <li>로그인 수단은 서버 설정에 따라 자동으로 노출됩니다.</li>
          <li>소셜 로그인 후에는 가입 상태에 따라 회원가입 또는 홈으로 이동합니다.</li>
        </ul>
      </div>
    </PhoneViewport>
  );
}
