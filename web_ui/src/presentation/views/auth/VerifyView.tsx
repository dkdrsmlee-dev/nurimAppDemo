import { useState } from 'react';

import { ActionError } from '../../components/ActionError/ActionError';
import { Button } from '../../components/Button/Button';
import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';

interface VerifyViewProps {
  profileName: string;
  telecomOptions: string[];
  isLoading: boolean;
  errorMessage: string;
  onBack: () => void;
  onContinue: () => void;
}

export function VerifyView({
  profileName,
  telecomOptions,
  isLoading,
  errorMessage,
  onBack,
  onContinue,
}: VerifyViewProps) {
  const [selectedTelecom, setSelectedTelecom] = useState('SKT');

  return (
    <PhoneViewport
      footer={
        <Button disabled={isLoading} onClick={onContinue}>
          {isLoading ? '인증 처리 중...' : '휴대폰 인증 진행하기'}
        </Button>
      }
    >
      <div className="screen-content">
        <div className="page-header">
          <span className="page-header__back" onClick={onBack}>
            ‹
          </span>
          <span>본인인증</span>
        </div>
        <div className="verification-hero">
          <div className="verification-hero__icon">◎</div>
          <h1>PASS 인증으로 실명 확인</h1>
          <p>{profileName || '회원'} 님의 휴대폰 인증 단계를 완료한 뒤 회원정보 입력 화면으로 이동합니다.</p>
        </div>
        <div className="chip-row">
          {telecomOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${selectedTelecom === option ? 'chip--active' : ''}`.trim()}
              onClick={() => setSelectedTelecom(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="info-card">
          <h2>향후 인증 완료 후 수집되는 정보</h2>
          <ul className="helper-list">
            <li>이름, 이동통신사, 휴대폰번호</li>
            <li>중복 가입 여부 확인</li>
            <li>이벤트 및 알림 발송을 위한 회원 식별 정보</li>
          </ul>
        </div>
        {errorMessage ? <ActionError message={errorMessage} /> : null}
      </div>
    </PhoneViewport>
  );
}
