import type { ProfileDraft, SocialProvider } from '../shared/types/app';

export const socialLoginProfiles: Record<
  SocialProvider,
  Pick<ProfileDraft, 'providerLabel' | 'name' | 'phone'>
> = {
  kakao: {
    providerLabel: '카카오',
    name: '홍길동',
    phone: '010-1234-5678',
  },
  naver: {
    providerLabel: '네이버',
    name: '김하늘',
    phone: '010-9876-5432',
  },
};
