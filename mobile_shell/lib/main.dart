import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';
import 'package:webview_flutter/webview_flutter.dart';

const _defaultKakaoNativeAppKey = '930bf238e56cb22cf6484fa8af790a5a';
const _kakaoNativeAppKey = String.fromEnvironment(
  'KAKAO_NATIVE_APP_KEY',
  defaultValue: _defaultKakaoNativeAppKey,
);
const _defaultNaverClientId = 'rOPP7lBMsxvpvDDFcrwF';
const _defaultNaverClientName = 'web3_네이버로그인';
const _naverClientId = String.fromEnvironment(
  'NAVER_CLIENT_ID',
  defaultValue: _defaultNaverClientId,
);
const _naverClientSecret = String.fromEnvironment(
  'NAVER_CLIENT_SECRET',
  defaultValue: '',
);
const _naverClientName = String.fromEnvironment(
  'NAVER_CLIENT_NAME',
  defaultValue: _defaultNaverClientName,
);
const _defaultNaverIosUrlScheme = 'com.dkdr.nurimdemo';
const _naverIosUrlScheme = String.fromEnvironment(
  'NAVER_IOS_URL_SCHEME',
  defaultValue: _defaultNaverIosUrlScheme,
);
const _naverAuthChannel = MethodChannel('nurimdemo/naver_auth');

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  KakaoSdk.init(nativeAppKey: _kakaoNativeAppKey);
  runApp(const NurimDemoApp());
}

class NurimDemoApp extends StatelessWidget {
  const NurimDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Nurim Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF111827)),
        scaffoldBackgroundColor: const Color(0xFFE6EBF4),
        useMaterial3: true,
      ),
      home: const NurimShellPage(),
    );
  }
}

class NurimShellPage extends StatefulWidget {
  const NurimShellPage({super.key});

  @override
  State<NurimShellPage> createState() => _NurimShellPageState();
}

class _NurimShellPageState extends State<NurimShellPage> {
  static const _tokenStorageKey = 'nurim.demo.jwt';
  static const _defaultDevServerUrl = 'http://192.168.0.157:5173';
  static const _defaultApiBaseUrl = 'http://192.168.0.147:4011';
  static const _callbackScheme = 'nurimdemo';
  static const _callbackHost = 'auth';
  static const _callbackPath = '/kakao/callback';

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final AppLinks _appLinks = AppLinks();

  late final WebViewController _controller;
  StreamSubscription<Uri>? _deepLinkSubscription;

  bool _isReady = false;
  bool _hasWebBridgeReady = false;
  String? _errorMessage;
  Uri? _pendingAuthCallbackUri;

  String get _devServerUrl {
    const configuredUrl = String.fromEnvironment(
      'NURIM_WEB_URL',
      defaultValue: _defaultDevServerUrl,
    );

    return configuredUrl.trim();
  }

  String get _apiBaseUrl {
    const configuredUrl = String.fromEnvironment(
      'NURIM_API_BASE_URL',
      defaultValue: _defaultApiBaseUrl,
    );

    return configuredUrl.trim().replaceFirst(RegExp(r'/$'), '');
  }

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00FFFFFF))
      ..addJavaScriptChannel('NurimBridge', onMessageReceived: _onBridgeMessage)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            if (!mounted) {
              return;
            }
            setState(() {
              _isReady = true;
            });
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame == false) {
              return;
            }
            if (!mounted) {
              return;
            }
            setState(() {
              _errorMessage =
                  'React 개발 서버 응답을 받지 못했습니다.\n'
                  '서버 주소: $_devServerUrl\n'
                  '요청 주소: ${error.url ?? '알 수 없음'}\n'
                  '오류: ${error.description}';
            });
          },
        ),
      );

    _initializeDeepLinks();
    _loadReactApp();
  }

  @override
  void dispose() {
    _deepLinkSubscription?.cancel();
    super.dispose();
  }

  Future<void> _loadReactApp() async {
    final devServerUrl = _devServerUrl;

    if (devServerUrl.isEmpty) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage =
            'React 개발 서버 주소가 비어 있습니다.\n'
            '예시: flutter run --dart-define=NURIM_WEB_URL=http://192.168.0.157:5173';
      });
      return;
    }

    try {
      setState(() {
        _isReady = false;
        _hasWebBridgeReady = false;
        _errorMessage = null;
      });
      await _controller.loadRequest(Uri.parse(devServerUrl));
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage =
            'React 개발 서버에 연결하지 못했습니다.\n'
            '서버 주소: $devServerUrl\n'
            '확인 사항:\n'
            '1. 맥북에서 npm run dev 실행\n'
            '2. 안드로이드 단말과 맥북이 같은 네트워크 연결\n'
            '3. IP 또는 포트가 바뀌지 않았는지 확인\n'
            '원본 오류: $error';
      });
    }
  }

  Future<void> _onBridgeMessage(JavaScriptMessage message) async {
    final decoded = jsonDecode(message.message);
    if (decoded is! Map<String, dynamic>) {
      return;
    }

    final type = decoded['type'] as String?;
    final payload = decoded['payload'];
    debugPrint('[bridge] message type=$type payload=$payload');

    switch (type) {
      case 'ready':
        _hasWebBridgeReady = true;
        await _sendBootstrap();
        await _flushPendingAuthCallback();
        break;
      case 'saveToken':
        if (payload is Map<String, dynamic>) {
          final token = payload['token'] as String?;
          if (token != null && token.isNotEmpty) {
            await _storage.write(key: _tokenStorageKey, value: token);
          }
        }
        break;
      case 'clearToken':
        await _storage.delete(key: _tokenStorageKey);
        break;
      case 'socialLoginRequested':
        if (payload is Map<String, dynamic>) {
          final provider = payload['provider'] as String?;
          if (provider != null) {
            await _startSocialLogin(provider);
          }
        }
        break;
      default:
        return;
    }
  }

  Future<void> _initializeDeepLinks() async {
    try {
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        _handleDeepLink(initialUri);
      }
    } on FormatException {
      // Ignore invalid deep link formats.
    }

    _deepLinkSubscription = _appLinks.uriLinkStream.listen(
      (uri) {
        _handleDeepLink(uri);
      },
      onError: (_) {
        // Ignore deep link stream errors and keep the current shell running.
      },
    );
  }

  void _handleDeepLink(Uri uri) {
    if (!_isKakaoCallbackUri(uri)) {
      return;
    }

    _pendingAuthCallbackUri = uri;
    if (_hasWebBridgeReady) {
      unawaited(_flushPendingAuthCallback());
    }
  }

  bool _isKakaoCallbackUri(Uri uri) {
    return uri.scheme == _callbackScheme &&
        uri.host == _callbackHost &&
        uri.path == _callbackPath;
  }

  Map<String, String> _extractCallbackParams(Uri uri) {
    final params = <String, String>{...uri.queryParameters};

    if (uri.fragment.isNotEmpty) {
      try {
        params.addAll(Uri.splitQueryString(uri.fragment));
      } on FormatException {
        // Ignore invalid fragment query data and keep known query params only.
      }
    }

    return params;
  }

  bool? _parseBool(String? value) {
    if (value == null) {
      return null;
    }

    final normalized = value.trim().toLowerCase();
    if (['true', '1', 'y', 'yes'].contains(normalized)) {
      return true;
    }
    if (['false', '0', 'n', 'no'].contains(normalized)) {
      return false;
    }

    return null;
  }

  Future<void> _flushPendingAuthCallback() async {
    final callbackUri = _pendingAuthCallbackUri;
    if (callbackUri == null || !_hasWebBridgeReady) {
      return;
    }

    _pendingAuthCallbackUri = null;
    final params = _extractCallbackParams(callbackUri);
    final token = params['token'] ?? params['accessToken'];
    final isRegistered =
        _parseBool(params['isRegistered']) ??
        _parseBool(params['registered']) ??
        _parseBool(params['signupCompleted']);
    final message =
        params['message'] ??
        params['msg'] ??
        params['error_description'] ??
        params['error'];
    final status = params['error'] == 'access_denied'
        ? 'cancelled'
        : params['error'] != null
        ? 'error'
        : 'success';

    final payload = <String, Object?>{
      'provider': 'kakao',
      'status': status,
      'callbackUrl': callbackUri.toString(),
      'message': message,
      'params': params,
    };

    if (token != null) {
      payload['token'] = token;
    }

    if (isRegistered != null) {
      payload['isRegistered'] = isRegistered;
    }

    if (params['nextStep'] != null) {
      payload['nextStep'] = params['nextStep'];
    }

    final profile = <String, String>{};
    if (params['name'] != null) {
      profile['name'] = params['name']!;
    }
    if (params['providerLabel'] != null) {
      profile['providerLabel'] = params['providerLabel']!;
    }
    if (params['phone'] != null) {
      profile['phone'] = params['phone']!;
    }
    if (profile.isNotEmpty) {
      payload['profile'] = profile;
    }

    await _dispatchToWeb({'type': 'socialLoginResult', 'payload': payload});
  }

  Future<void> _startSocialLogin(String provider) async {
    debugPrint('[social] start provider=$provider');
    try {
      String providerAccessToken;
      String? providerRefreshToken;
      String? providerUserId;
      String resolvedName;
      String resolvedPhone;
      String providerLabel;
      String callbackUrl;
      final providerParams = <String, String>{};

      switch (provider) {
        case 'kakao':
          debugPrint('[social] using kakao sdk flow');
          late final OAuthToken oauthToken;
          if (await isKakaoTalkInstalled()) {
            try {
              oauthToken = await UserApi.instance.loginWithKakaoTalk();
            } catch (error) {
              if (error is PlatformException && error.code == 'CANCELED') {
                await _dispatchSocialLoginFailure(
                  provider: provider,
                  message: '카카오 로그인이 취소되었습니다.',
                  status: 'cancelled',
                );
                return;
              }

              oauthToken = await UserApi.instance.loginWithKakaoAccount();
            }
          } else {
            oauthToken = await UserApi.instance.loginWithKakaoAccount();
          }

          final user = await UserApi.instance.me();
          providerAccessToken = oauthToken.accessToken;
          providerRefreshToken = oauthToken.refreshToken;
          providerUserId = '${user.id}';
          resolvedName =
              user.kakaoAccount?.profile?.nickname?.trim().isNotEmpty == true
              ? user.kakaoAccount!.profile!.nickname!.trim()
              : '카카오 사용자';
          resolvedPhone = user.kakaoAccount?.phoneNumber?.trim() ?? '';
          providerLabel = '카카오';
          callbackUrl = 'kakao-sdk://login';
          providerParams.addAll({
            'kakaoAccessToken': providerAccessToken,
            'kakaoUserId': providerUserId,
          });
          if (providerRefreshToken case final refreshToken?) {
            providerParams['kakaoRefreshToken'] = refreshToken;
          }
          break;
        case 'naver':
          debugPrint('[social] using naver sdk flow');
          final naverResult = await _loginWithNaverSdk();
          debugPrint(
            '[social][naver] sdk result keys=${naverResult.keys.toList()}',
          );
          providerAccessToken = naverResult['accessToken'] ?? '';
          providerRefreshToken = naverResult['refreshToken'];
          providerUserId = naverResult['userId'];
          resolvedName =
              naverResult['name'] ?? naverResult['nickname'] ?? '네이버 사용자';
          resolvedPhone = naverResult['mobile'] ?? '';
          providerLabel = '네이버';
          callbackUrl = 'naver-sdk://login';
          providerParams.addAll({'naverAccessToken': providerAccessToken});
          if (providerUserId case final userId?) {
            providerParams['naverUserId'] = userId;
          }
          if (providerRefreshToken case final refreshToken?) {
            providerParams['naverRefreshToken'] = refreshToken;
          }
          break;
        default:
          await _dispatchSocialLoginFailure(
            provider: provider,
            message: '$provider 로그인은 아직 앱에 연결되지 않았습니다.',
          );
          return;
      }

      if (providerAccessToken.trim().isEmpty) {
        throw Exception('$provider access token을 받지 못했습니다.');
      }

      debugPrint(
        '[social] backend login provider=$provider '
        'accessTokenLength=${providerAccessToken.length}',
      );
      final backendResult = await _loginWithSnsBackend(
        provider: provider,
        providerAccessToken: providerAccessToken,
      );
      final backendData = _readBackendData(backendResult);
      final isNewUser = _parseBackendIsNewUser(backendData);
      final nextStep =
          _readBackendString(backendData, const ['nextStep']) ??
          (isNewUser == true ? 'signup' : 'home');
      final accessToken = _readBackendString(backendData, const [
        'accessToken',
        'token',
        'jwt',
        'jwtToken',
      ]);
      final signupToken = _readBackendString(backendData, const [
        'signupToken',
      ]);
      final signupCredential = signupToken ?? accessToken;
      final refreshToken = _readBackendString(backendData, const [
        'refreshToken',
      ]);
      final sessionId = _readBackendString(backendData, const ['sessionId']);
      final signupExpiresInSec = _readBackendString(backendData, const [
        'signupExpiresInSec',
      ]);
      final profileData = backendData['profile'] is Map<String, dynamic>
          ? backendData['profile'] as Map<String, dynamic>
          : const <String, dynamic>{};
      providerUserId =
          _readBackendString(profileData, const ['providerUserId']) ??
          providerUserId;
      debugPrint(
        '[social-backend][$provider] result '
        'keys=${backendData.keys.toList()} '
        'isNewUser=$isNewUser '
        'nextStep=$nextStep '
        'hasAccessToken=${accessToken != null} '
        'hasSignupToken=${signupToken != null} '
        'hasRefreshToken=${refreshToken != null}',
      );
      if (signupToken != null) {
        debugPrint('[social-backend][$provider] signupToken=$signupToken');
      }
      resolvedName =
          _readBackendString(profileData, const ['name', 'nickname']) ??
          resolvedName;
      resolvedPhone =
          _readBackendString(profileData, const ['phone', 'mobile']) ??
          resolvedPhone;
      final socialLoginParams = <String, String>{
        ...providerParams,
        if (isNewUser != null) 'isNewUser': '$isNewUser',
      };
      if (refreshToken != null) {
        socialLoginParams['refreshToken'] = refreshToken;
      }
      if (sessionId != null) {
        socialLoginParams['sessionId'] = sessionId;
      }
      if (signupCredential != null) {
        socialLoginParams['signupToken'] = signupCredential;
      }
      if (signupExpiresInSec != null) {
        socialLoginParams['signupExpiresInSec'] = signupExpiresInSec;
      }
      if (providerUserId != null) {
        socialLoginParams['providerUserId'] = providerUserId;
      }

      await _dispatchToWeb({
        'type': 'socialLoginResult',
        'payload': {
          'provider': provider,
          'status': 'success',
          'nextStep': nextStep,
          'isRegistered': nextStep == 'home',
          'token': nextStep == 'signup' ? signupCredential : accessToken,
          'callbackUrl': callbackUrl,
          'params': socialLoginParams,
          'profile': {
            'name': resolvedName,
            'providerLabel': providerLabel,
            'phone': resolvedPhone,
          },
        },
      });
    } catch (error) {
      debugPrint('[social] failure provider=$provider error=$error');
      await _dispatchSocialLoginFailure(
        provider: provider,
        message: '${provider.toUpperCase()} SDK 로그인에 실패했습니다. $error',
      );
    }
  }

  Future<void> _sendBootstrap() async {
    final token = await _storage.read(key: _tokenStorageKey);
    await _dispatchToWeb({
      'type': 'bootstrap',
      'payload': {'token': token},
    });
  }

  Future<void> _dispatchToWeb(Map<String, dynamic> message) async {
    final payload = jsonEncode(message);
    await _controller.runJavaScript('''
      window.dispatchEvent(new CustomEvent('nurim-native', { detail: $payload }));
      ''');
  }

  Future<void> _dispatchSocialLoginFailure({
    required String provider,
    required String message,
    String status = 'error',
  }) async {
    await _dispatchToWeb({
      'type': 'socialLoginResult',
      'payload': {'provider': provider, 'status': status, 'message': message},
    });
  }

  Future<Map<String, dynamic>> _loginWithSnsBackend({
    required String provider,
    required String providerAccessToken,
  }) async {
    final endpoint = Uri.parse(
      '$_apiBaseUrl/api/v1/auth/social/${provider.toLowerCase()}',
    );
    debugPrint('[social-backend][$provider] POST $endpoint');
    final client = HttpClient();

    try {
      final request = await client.postUrl(endpoint);
      request.headers.contentType = ContentType.json;
      request.add(
        utf8.encode(
          jsonEncode({
            'provider': provider.toUpperCase(),
            'providerAccessToken': providerAccessToken,
          }),
        ),
      );

      final response = await request.close();
      final responseText = await response.transform(utf8.decoder).join();
      final decoded = responseText.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(responseText) as Map<String, dynamic>;

      if (response.statusCode < 200 || response.statusCode >= 300) {
        debugPrint(
          '[social-backend][$provider] failed '
          'status=${response.statusCode} body=$responseText',
        );
        throw Exception(
          _extractBackendErrorMessage(decoded) ??
              'SNS 로그인 API 요청에 실패했습니다. (HTTP ${response.statusCode})',
        );
      }

      final responseCode = _readBackendString(decoded, const ['code']);
      if (responseCode != null && responseCode != 'COMMON.SUCCESS') {
        debugPrint(
          '[social-backend][$provider] failed code=$responseCode body=$responseText',
        );
        throw Exception(
          _extractBackendErrorMessage(decoded) ??
              'SNS 로그인 API 요청에 실패했습니다. (code: $responseCode)',
        );
      }

      debugPrint(
        '[social-backend][$provider] success status=${response.statusCode} body=$responseText',
      );
      return decoded;
    } finally {
      client.close(force: true);
    }
  }

  Future<Map<String, String?>> _loginWithNaverSdk() async {
    debugPrint(
      '[social][naver] invoking native channel '
      'clientId=$_naverClientId clientName=$_naverClientName',
    );
    final result = await _naverAuthChannel
        .invokeMapMethod<String, dynamic>('login', {
          'clientId': _naverClientId,
          'clientSecret': _naverClientSecret,
          'clientName': _naverClientName,
          'urlScheme': _naverIosUrlScheme,
        });

    if (result == null || result.isEmpty) {
      throw Exception('네이버 로그인 결과를 받지 못했습니다.');
    }

    debugPrint('[social][naver] native result=$result');
    return result.map((key, value) => MapEntry(key, value?.toString()));
  }

  Map<String, dynamic> _readBackendData(Map<String, dynamic> payload) {
    final data = payload['data'];
    if (data is Map<String, dynamic>) {
      return data;
    }

    return payload;
  }

  bool? _parseBackendIsNewUser(Map<String, dynamic> payload) {
    const keys = ['isNewUser', 'newUser', 'requiresSignup'];
    for (final key in keys) {
      final rawValue = payload[key];
      if (rawValue is bool) {
        return rawValue;
      }
      if (rawValue is String) {
        return _parseBool(rawValue);
      }
    }

    return null;
  }

  String? _readBackendString(Map<String, dynamic> payload, List<String> keys) {
    for (final key in keys) {
      final rawValue = payload[key];
      if (rawValue is String && rawValue.trim().isNotEmpty) {
        return rawValue.trim();
      }
    }

    return null;
  }

  String? _extractBackendErrorMessage(Map<String, dynamic> payload) {
    final directMessage = _readBackendString(payload, const [
      'msg',
      'message',
      'error_description',
      'error',
    ]);
    if (directMessage != null) {
      return directMessage;
    }

    final nestedData = payload['data'];
    if (nestedData is Map<String, dynamic>) {
      return _readBackendString(nestedData, const [
        'msg',
        'message',
        'error_description',
        'error',
      ]);
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: _errorMessage == null
                  ? WebViewWidget(controller: _controller)
                  : _ErrorState(
                      message: _errorMessage!,
                      onRetry: _loadReactApp,
                    ),
            ),
            if (!_isReady && _errorMessage == null)
              const Positioned.fill(
                child: ColoredBox(
                  color: Color(0xFFF4F6FA),
                  child: Center(
                    child: CircularProgressIndicator(color: Color(0xFF111827)),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: const [
              BoxShadow(
                blurRadius: 40,
                color: Color(0x14000000),
                offset: Offset(0, 20),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 48,
                  color: Color(0xFFB42318),
                ),
                const SizedBox(height: 16),
                Text(
                  'React 개발 서버에 접속할 수 없습니다',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
                FilledButton(onPressed: onRetry, child: const Text('다시 시도')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
