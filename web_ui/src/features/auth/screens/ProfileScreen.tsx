import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProfileView } from '../../../presentation/views/auth/ProfileView';
import { getActionErrorMessage } from '../../../shared/lib/getActionErrorMessage';
import { submitSignupProfile } from '../../../shared/lib/signupApi';
import type { ProfileDraft } from '../../../shared/types/app';
import { useAppContext } from '../../../state/app/useAppContext';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { profile, signupToken, updateProfile } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (nextProfile: ProfileDraft) => {
    if (!signupToken) {
      setErrorMessage('회원가입 토큰이 없어 회원정보를 저장할 수 없습니다. 소셜 로그인을 다시 시도해 주세요.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await submitSignupProfile(signupToken, {
        zipCode: nextProfile.zipCode,
        address1: nextProfile.address1,
        address2: nextProfile.address2,
      });
      updateProfile(nextProfile);
      navigate('/auth/complete');
    } catch (error) {
      setErrorMessage(
        getActionErrorMessage(error, '회원정보 저장에 실패했습니다. 다시 시도해 주세요.'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileView
      initialProfile={profile}
      isSaving={isSaving}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
    />
  );
}
