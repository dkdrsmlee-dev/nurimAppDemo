# Collaboration Guide

`web_ui/src`는 아래처럼 역할을 분리합니다.

## 디자이너 / 퍼블리셔

수정 가능 영역:

- `src/presentation/components`
- `src/presentation/views`
- `src/presentation/styles`
- `src/presentation/fixtures`

담당 범위:

- 화면 마크업
- CSS, 모션, 반응형
- 퍼블리싱용 로컬 UI 상태
- 화면용 목업 문구와 정적 컨텐츠

건드리지 않는 영역:

- `src/features`
- `src/state`
- `src/bridge`
- `src/app`
- 네이티브 브리지, 라우팅, 토큰, 인증 상태

## 프론트엔드 개발자

수정 가능 영역:

- `src/app`
- `src/features`
- `src/state`
- `src/bridge`
- `src/shared`

담당 범위:

- 라우팅
- 전역 상태
- 네이티브 브리지
- 인증 플로우
- API 및 실제 연동
- View에 전달할 props 조합

## 공통 규칙

1. `features/*/screens/*Screen.tsx`는 Container 역할만 합니다.
2. Container는 상태 조회, 이벤트 처리, 라우팅만 맡습니다.
3. `presentation/views/*View.tsx`는 View 역할만 합니다.
4. View는 `props`만 받아서 그립니다.
5. View 안에서 `useNavigate`, `localStorage`, `nativeBridge`, `fetch`, `AppContext`를 직접 사용하지 않습니다.
6. 디자이너가 필요한 퍼블리싱용 UI 상태는 View 내부에서 관리합니다.
7. 실제 비즈니스 상태는 Container나 `state/bridge`에 둡니다.

## 작업 흐름

1. 프론트엔드 개발자가 Screen과 View의 props 계약을 먼저 정합니다.
2. 디자이너는 `presentation`만 수정해 화면을 완성합니다.
3. 프론트엔드 개발자는 `features/state/bridge`에서 실제 동작을 연결합니다.
4. View props가 바뀌면 Screen도 같이 맞춥니다.
