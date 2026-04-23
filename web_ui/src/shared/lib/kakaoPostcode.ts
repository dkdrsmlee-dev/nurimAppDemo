declare global {
  interface Window {
    daum?: {
      Postcode?: KakaoPostcodeConstructor;
    };
    kakao?: {
      Postcode?: KakaoPostcodeConstructor;
    };
  }
}

export interface KakaoPostcodeData {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: 'R' | 'J';
}

interface KakaoPostcodeEmbedOptions {
  width?: string;
  height?: string;
  autoClose?: boolean;
  maxSuggestItems?: number;
}

interface KakaoPostcodeInstance {
  embed: (element: HTMLElement, options?: KakaoPostcodeEmbedOptions) => void;
}

interface KakaoPostcodeOptions {
  oncomplete: (data: KakaoPostcodeData) => void;
  onresize?: (size: { width: number; height: number }) => void;
  width?: string;
  height?: string;
  maxSuggestItems?: number;
}

interface KakaoPostcodeConstructor {
  new (options: KakaoPostcodeOptions): KakaoPostcodeInstance;
}

const postcodeScriptUrl =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

let loadPromise: Promise<KakaoPostcodeConstructor> | null = null;

function readPostcodeConstructor() {
  const Postcode = window.daum?.Postcode ?? window.kakao?.Postcode;
  if (!Postcode) {
    throw new Error('Daum 우편번호 서비스를 불러오지 못했습니다.');
  }

  return Postcode;
}

export function loadKakaoPostcodeScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저 환경에서만 주소검색을 사용할 수 있습니다.'));
  }

  if (window.daum?.Postcode ?? window.kakao?.Postcode) {
    return Promise.resolve(readPostcodeConstructor());
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<KakaoPostcodeConstructor>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${postcodeScriptUrl}"]`,
    );

    const handleResolve = () => {
      try {
        resolve(readPostcodeConstructor());
      } catch (error) {
        reject(error);
      }
    };

    if (existingScript) {
      existingScript.addEventListener('load', handleResolve, { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Daum 우편번호 스크립트를 불러오지 못했습니다.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = postcodeScriptUrl;
    script.async = true;
    script.onload = handleResolve;
    script.onerror = () => reject(new Error('Daum 우편번호 스크립트를 불러오지 못했습니다.'));
    document.head.appendChild(script);
  }).catch((error) => {
    loadPromise = null;
    throw error;
  });

  return loadPromise;
}
