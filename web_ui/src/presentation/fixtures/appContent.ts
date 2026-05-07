import type { AddressResult, EventCard, OnboardingSlide, QuickTabItem, TabDescriptionMap, TermItem } from '../../shared/types/content';

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    eyebrow: 'JWT token check',
    title: '앱 실행 직후 로그인 상태를 빠르게 복구합니다',
    description:
      '저장된 토큰이 있으면 바로 홈으로 이동하고, 없으면 로그인과 회원가입 플로우를 이어서 진행합니다.',
  },
  {
    id: 2,
    eyebrow: 'SNS login',
    title: '카카오와 네이버 중심의 간단한 가입 시작 화면',
    description:
      '서비스 시작하기 화면은 소셜 로그인 버튼에 집중하고, 약관 동의와 본인인증은 다음 단계로 자연스럽게 넘깁니다.',
  },
  {
    id: 3,
    eyebrow: 'Verification flow',
    title: 'PASS 본인인증과 회원정보 입력을 같은 흐름으로 묶습니다',
    description:
      '이번 버전은 실제 연동 대신 UI와 상태 전환을 먼저 고정해서 iOS와 Android에서 같은 경험을 만들 수 있게 구성합니다.',
  },
];

export const termItems: TermItem[] = [
  {
    key: 'age',
    title: '[필수] 만 14세 이상입니다.',
    description: '본 서비스는 14세 이상 사용자만 가입할 수 있습니다.',
  },
  {
    key: 'service',
    title: '[필수] 서비스 이용약관 동의',
    description: '서비스 제공을 위해 필요한 기본 약관입니다.',
  },
  {
    key: 'privacy',
    title: '[필수] 개인정보 수집 및 이용 동의',
    description: '회원 식별, 본인인증, 알림 제공을 위한 필수 동의 항목입니다.',
  },
  {
    key: 'marketing',
    title: '[선택] 마케팅 정보 수신 동의',
    description: '이벤트와 혜택 알림을 받습니다.',
  },
];

export const telecomOptions = ['SKT', 'KT', 'LG U+', '알뜰폰'];

export const addressResults: AddressResult[] = [
  {
    id: '1',
    zipCode: '13595',
    road: '경기 성남시 분당구 수내동 6-6',
    jibun: '[지번] 경기 성남시 분당구 수내동 6-6',
  },
  {
    id: '2',
    zipCode: '13595',
    road: '경기 성남시 분당구 황새울로258번길 35',
    jibun: '[지번] 경기 성남시 분당구 서현동 255-1',
  },
  {
    id: '3',
    zipCode: '05551',
    road: '서울 송파구 올림픽로 300',
    jibun: '[지번] 서울 송파구 신천동 29',
  },
];

export const noticeItems = [
  '출시 일정과 공지사항',
  '이벤트 알림',
  '추가 등록 정보 요청',
];

export const eventCards: EventCard[] = [
  {
    title: '매일 매일 출석체크 하면 리워드가 매일 팡팡',
    description: '출석체크 후 리워드를 지급하는 이벤트 상세로 이동할 수 있습니다.',
  },
  {
    title: '마이펫 촬영하면 매일 리워드가 지급됩니다.',
    description: '일별 촬영 미션 완료 후 리워드를 받는 이벤트 상세로 이동할 수 있습니다.',
  },
];

export const quickTabs: QuickTabItem[] = [
  { key: 'home', label: 'HOME' },
  { key: 'news', label: '메뉴_A' },
  { key: 'my', label: '메뉴_B' },
  { key: 'benefit', label: '메뉴_C' },
  { key: 'event', label: '이벤트' },
];

export const tabDescriptions: TabDescriptionMap = {
  home: '메인 배너, 공지, 추천 이벤트 영역을 먼저 구성했습니다.',
  news: '공지와 알림 피드를 넣을 자리입니다.',
  my: '마이페이지와 설정 화면을 연결할 수 있습니다.',
  benefit: '쿠폰, 포인트, 제휴 혜택을 배치할 수 있습니다.',
  event: '운영 이벤트 및 관리자 배너를 노출할 수 있습니다.',
};
