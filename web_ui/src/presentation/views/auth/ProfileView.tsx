import { useEffect, useRef, useState } from 'react';

import { loadKakaoPostcodeScript, type KakaoPostcodeData } from '../../../shared/lib/kakaoPostcode';
import type { ProfileDraft } from '../../../shared/types/app';
import { Button } from '../../components/Button/Button';
import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';

const years = Array.from({ length: 50 }, (_, index) => 2006 - index);
const months = Array.from({ length: 12 }, (_, index) => index + 1);
const days = Array.from({ length: 31 }, (_, index) => index + 1);

interface ProfileViewProps {
  initialProfile: ProfileDraft;
  isSaving: boolean;
  errorMessage: string;
  onSubmit: (profile: ProfileDraft) => Promise<void> | void;
}

export function ProfileView({
  initialProfile,
  isSaving,
  errorMessage,
  onSubmit,
}: ProfileViewProps) {
  const [form, setForm] = useState(initialProfile);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState('');
  const [showBirthSheet, setShowBirthSheet] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2002);
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedDay, setSelectedDay] = useState(2);
  const postcodeContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setForm(initialProfile);
  }, [initialProfile]);

  const canSave = form.zipCode.trim() !== '' && form.address1.trim() !== '' && form.address2.trim() !== '';

  const applyBirthDate = () => {
    const birthDate = `${selectedYear}년 ${selectedMonth}월 ${selectedDay}일`;
    setForm((current) => ({
      ...current,
      birthDate,
    }));
    setShowBirthSheet(false);
  };

  useEffect(() => {
    if (!showAddressSearch) {
      return;
    }

    const postcodeContainer = postcodeContainerRef.current;
    let cancelled = false;

    const handleComplete = (data: KakaoPostcodeData) => {
      if (cancelled) {
        return;
      }

      const address =
        data.userSelectedType === 'R'
          ? data.roadAddress || data.address
          : data.jibunAddress || data.address;

      setForm((current) => ({
        ...current,
        zipCode: data.zonecode,
        address1: address,
      }));
      setAddressSearchError('');
      setShowAddressSearch(false);
    };

    const mountPostcode = async () => {
      setIsAddressSearchLoading(true);
      setAddressSearchError('');

      try {
        const Postcode = await loadKakaoPostcodeScript();
        if (cancelled || !postcodeContainer) {
          return;
        }

        postcodeContainer.innerHTML = '';
        new Postcode({
          oncomplete: handleComplete,
          onresize: (size) => {
            postcodeContainer.style.height = `${Math.max(size.height, 420)}px`;
          },
          width: '100%',
          height: '100%',
          maxSuggestItems: 5,
        }).embed(postcodeContainer, {
          width: '100%',
          height: '100%',
          autoClose: false,
          maxSuggestItems: 5,
        });
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error && error.message.trim()
              ? error.message.trim()
              : '주소검색 서비스를 열지 못했습니다. 다시 시도해 주세요.';
          setAddressSearchError(message);
        }
      } finally {
        if (!cancelled) {
          setIsAddressSearchLoading(false);
        }
      }
    };

    void mountPostcode();

    return () => {
      cancelled = true;
      if (postcodeContainer) {
        postcodeContainer.innerHTML = '';
      }
    };
  }, [showAddressSearch]);

  if (showAddressSearch) {
    return (
      <PhoneViewport>
        <div className="address-search-screen">
          <div className="address-search-screen__header">
            <button
              type="button"
              className="page-header__back address-search-screen__back"
              onClick={() => setShowAddressSearch(false)}
            >
              ‹
            </button>
            <span>주소찾기</span>
          </div>
          <div className="address-search-screen__body">
            <p className="postcode-shell__helper">도로명, 건물명, 지번으로 검색한 뒤 주소를 선택해 주세요.</p>
            {addressSearchError ? <p className="action-error">{addressSearchError}</p> : null}
            <div className="postcode-shell postcode-shell--page">
              {isAddressSearchLoading ? (
                <div className="postcode-shell__loading">주소검색 서비스를 불러오는 중입니다.</div>
              ) : null}
              <div
                ref={postcodeContainerRef}
                className={`postcode-shell__frame postcode-shell__frame--page ${isAddressSearchLoading ? 'postcode-shell__frame--hidden' : ''}`.trim()}
              />
            </div>
          </div>
        </div>
      </PhoneViewport>
    );
  }

  return (
    <PhoneViewport
      footer={
        <Button disabled={!canSave || isSaving} onClick={() => onSubmit(form)}>
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      }
    >
      <div className="screen-content">
        <div className="page-header">
          <span>회원정보 입력</span>
        </div>
        <div className="section-block">
          <div className="section-block__title">자동입력</div>
          <div className="field-grid">
            <label className="field">
              <span>이름</span>
              <input value={form.name} readOnly />
            </label>
            <label className="field">
              <span>연결계정</span>
              <input value={form.providerLabel} readOnly />
            </label>
            <label className="field">
              <span>휴대폰번호</span>
              <input value={form.phone} readOnly />
            </label>
          </div>
        </div>

        <div className="section-block">
          <div className="section-block__title">추가 등록 정보</div>
          {errorMessage ? <p className="action-error">{errorMessage}</p> : null}
          <div className="field-grid">
            <label className="field">
              <span>우편번호</span>
              <input value={form.zipCode} placeholder="주소찾기로 우편번호를 선택해 주세요." readOnly />
            </label>
            <label className="field">
              <span>주소</span>
              <div className="inline-field">
                <input value={form.address1} placeholder="주소 검색으로 주소를 입력해 주세요." readOnly />
                <Button variant="secondary" fullWidth={false} onClick={() => setShowAddressSearch(true)}>
                  주소찾기
                </Button>
              </div>
            </label>
            <label className="field">
              <span>상세 주소</span>
              <input
                value={form.address2}
                placeholder="상세 주소를 입력해 주세요."
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address2: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span>생년월일</span>
              <button type="button" className="picker-field" onClick={() => setShowBirthSheet(true)}>
                <span>{form.birthDate || '생년월일을 선택해 주세요.'}</span>
                <span>›</span>
              </button>
            </label>
          </div>
        </div>
      </div>

      {showBirthSheet ? (
        <div className="overlay overlay--bottom">
          <div className="bottom-sheet">
            <div className="page-header">
              <span className="page-header__back" onClick={() => setShowBirthSheet(false)}>
                ×
              </span>
              <span>생년월일 입력</span>
            </div>
            <div className="wheel-grid">
              <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
              <select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))}>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                ))}
              </select>
              <select value={selectedDay} onChange={(event) => setSelectedDay(Number(event.target.value))}>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}일
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={applyBirthDate}>입력</Button>
          </div>
        </div>
      ) : null}
    </PhoneViewport>
  );
}
