# web_ui

Nurim 데모 앱의 React 프론트엔드입니다. Flutter `WebView` 안에서 실행되고, 개발 중에는 맥북에서 띄운 Vite 서버에 직접 연결합니다.

## 폴더 구조

```txt
src/
  app/           라우터와 상위 provider
  bridge/        Flutter WebView 브리지와 네이티브 연동 mock
  features/      프론트엔드 개발자 영역, 화면별 container
  presentation/  디자이너/퍼블리셔 영역, view/component/style/fixture
  shared/        공통 타입과 helper
  state/         전역 앱 상태
```

## 역할 분리 원칙

- `features/*Screen.tsx`: 라우팅, 상태 조회, 이벤트 처리
- `presentation/*View.tsx`: 마크업, CSS class 연결, 로컬 UI 상태
- `presentation/components`: 공용 UI 조각
- `presentation/styles`: 디자이너가 관리하는 전역 스타일
- `bridge/state/app`: 프론트엔드 개발자가 관리

자세한 협업 규칙은 [COLLABORATION.md](/Users/smlee/project/ref/nurimAppDemo/web_ui/COLLABORATION.md)를 따릅니다.

## 개발 모드

```bash
npm install
npm run dev
```

기본 개발 서버는 `0.0.0.0:5173`으로 열립니다.

## 빌드

```bash
npm run build
```

빌드 결과물은 `../mobile_shell/assets/web`로 출력됩니다.
