import type { ProfileDraft } from '../../../shared/types/app';
import { ActionError } from '../../components/ActionError/ActionError';
import { Button } from '../../components/Button/Button';
import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';

interface CompleteViewProps {
  profile: ProfileDraft;
  isSaving: boolean;
  errorMessage: string;
  onBack: () => void;
  onStartService: () => void;
}

export function CompleteView({
  profile,
  isSaving,
  errorMessage,
  onBack,
  onStartService,
}: CompleteViewProps) {
  return (
    <PhoneViewport
      footer={
        <Button disabled={isSaving} onClick={onStartService}>
          {isSaving ? '가입 완료 처리 중...' : '서비스 시작하기'}
        </Button>
      }
    >
      <div className="screen-content complete-screen">
        <div className="page-header">
          <span className="page-header__back" onClick={onBack}>
            ‹
          </span>
          <span>회원가입 완료</span>
        </div>
        <div className="complete-card">
          <div className="verification-hero__icon">✓</div>
          <h1>{profile.name || '회원'}님, 환영합니다</h1>
          <p>NURIM OS 회원가입이 완료되었습니다. 다음 단계에서는 홈 화면과 알림 영역을 먼저 확인할 수 있습니다.</p>
          <dl className="summary-grid">
            <div>
              <dt>이름</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>연결계정</dt>
              <dd>{profile.providerLabel}</dd>
            </div>
            <div>
              <dt>휴대폰번호</dt>
              <dd>{profile.phone}</dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>{profile.address1}</dd>
            </div>
            <div>
              <dt>생년월일</dt>
              <dd>{profile.birthDate}</dd>
            </div>
          </dl>
          {errorMessage ? <ActionError message={errorMessage} /> : null}
        </div>
      </div>
    </PhoneViewport>
  );
}
