import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CompleteView } from '../../../presentation/views/auth/CompleteView';
import { getActionErrorMessage } from '../../../shared/lib/getActionErrorMessage';
import { completeSignup } from '../../../shared/lib/signupApi';
import { useAppContext } from '../../../state/app/useAppContext';

export function CompleteScreen() {
  const navigate = useNavigate();
  const { finishSignup, profile, signupToken } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const startService = async () => {
    if (!signupToken) {
      setErrorMessage('회원가입 토큰이 없어 가입 완료를 진행할 수 없습니다. 처음부터 다시 시도해 주세요.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await completeSignup(signupToken);
      if (!result.accessToken) {
        throw new Error('가입완료 응답에 accessToken이 없습니다.');
      }
      await finishSignup(result.accessToken);
      navigate('/home', { replace: true });
    } catch (error) {
      setErrorMessage(getActionErrorMessage(error, '회원가입 완료 처리에 실패했습니다. 다시 시도해 주세요.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CompleteView
      profile={profile}
      isSaving={isSaving}
      errorMessage={errorMessage}
      onBack={() => navigate(-1)}
      onStartService={startService}
    />
  );
}
