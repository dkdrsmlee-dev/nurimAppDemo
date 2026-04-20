import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';

interface SplashViewProps {
  bootReady: boolean;
}

export function SplashView({ bootReady }: SplashViewProps) {
  return (
    <PhoneViewport className="phone-viewport--dark">
      <div className="splash-screen">
        <div className="brand-mark brand-mark--large">n</div>
        <div className="splash-screen__title">NURIM OS</div>
        <div className="splash-screen__subtitle">
          {bootReady ? '보안 상태를 확인하고 있습니다.' : 'JWT 토큰을 확인하는 중입니다.'}
        </div>
      </div>
    </PhoneViewport>
  );
}
