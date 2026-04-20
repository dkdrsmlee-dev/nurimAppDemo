import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { telecomOptions } from '../../../presentation/fixtures/appContent';
import { VerifyView } from '../../../presentation/views/auth/VerifyView';
import { getActionErrorMessage } from '../../../shared/lib/getActionErrorMessage';
import { fetchSignupProfileInit, verifySignupPhone } from '../../../shared/lib/signupApi';
import type { ProfileDraft, SocialProvider } from '../../../shared/types/app';
import { useAppContext } from '../../../state/app/useAppContext';

function mapProvider(provider?: string | null): {
  provider: SocialProvider | null;
  providerLabel: ProfileDraft['providerLabel'];
} {
  switch (provider?.toUpperCase()) {
    case 'KAKAO':
      return { provider: 'kakao', providerLabel: '카카오' };
    case 'NAVER':
      return { provider: 'naver', providerLabel: '네이버' };
    default:
      return { provider: null, providerLabel: provider ?? '' };
  }
}

export function VerifyScreen() {
  const navigate = useNavigate();
  const { markVerificationComplete, profile, signupToken, updateProfile } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = async () => {
    if (!signupToken) {
      setErrorMessage('회원가입 토큰이 없어 본인인증을 진행할 수 없습니다. 카카오 로그인을 다시 시도해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await verifySignupPhone(signupToken);
      const initialProfile = await fetchSignupProfileInit(signupToken);
      const { provider, providerLabel } = mapProvider(initialProfile.provider);
      updateProfile({
        name: initialProfile.name ?? profile.name,
        phone: initialProfile.phoneNumber ?? profile.phone,
        provider: provider ?? profile.provider,
        providerLabel: providerLabel || profile.providerLabel,
      });
      markVerificationComplete();
      navigate('/auth/profile');
    } catch (error) {
      setErrorMessage(
        getActionErrorMessage(error, '휴대폰 인증 단계 처리에 실패했습니다. 다시 시도해 주세요.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VerifyView
      profileName={profile.name}
      telecomOptions={telecomOptions}
      isLoading={isSubmitting}
      errorMessage={errorMessage}
      onBack={() => navigate(-1)}
      onContinue={handleContinue}
    />
  );
}
