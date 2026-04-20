# nurimAppDemo

Flutter shell 위에 React UI를 올린 Nurim 앱 데모입니다.

## 구조

- `mobile_shell`: iOS/Android 앱 셸, WebView, JWT 저장 브리지
- `web_ui`: React 기반 화면, 라우팅, 목업 상태

## 개발 모드 실행

React 화면을 맥북에서 띄우고 Flutter 앱이 그 서버에 직접 붙는 방식입니다.

```bash
cd /Users/smlee/project/ref/nurimAppDemo/web_ui
npm install
npm run dev

cd /Users/smlee/project/ref/nurimAppDemo/mobile_shell
flutter pub get
flutter run
```

기본 개발 서버 주소는 `http://192.168.0.157:5173` 입니다.

IP가 바뀌면 아래처럼 덮어쓸 수 있습니다.

```bash
cd /Users/smlee/project/ref/nurimAppDemo/mobile_shell
flutter run --dart-define=NURIM_WEB_URL=http://새로운_IP:5173
```

네이버 로그인을 테스트할 때는 네이버 Client Secret을 로컬 실행 인자로 전달합니다.

```bash
cd /Users/smlee/project/ref/nurimAppDemo/mobile_shell
flutter run \
  --dart-define=NURIM_WEB_URL=http://새로운_IP:5173 \
  --dart-define=NURIM_API_BASE_URL=http://백엔드_IP:4011 \
  --dart-define=NAVER_CLIENT_SECRET=네이버_CLIENT_SECRET
```

## 현재 포함된 화면

- Splash
- Onboarding
- SNS 시작 화면
- 약관 동의
- PASS 본인인증 목업
- 회원정보 입력
- 가입 완료
- 홈 메인

## 현재 네이티브에서 맡는 역할

- WebView 호스팅
- JWT 저장과 삭제
- React 앱 부트스트랩 이벤트 전달
- 개발 중 외부 React 서버 접속

## 다음 단계

1. 카카오/네이버 실제 SDK 연동
2. PASS 또는 본인인증 네이티브 연동
3. 주소 검색 API 연결
4. 백엔드 API와 JWT 갱신 로직 연결
