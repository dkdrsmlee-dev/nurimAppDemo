import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TermsView } from '../../../presentation/views/auth/TermsView';
import { getActionErrorMessage } from '../../../shared/lib/getActionErrorMessage';
import { fetchActiveTerms, submitSignupTerms } from '../../../shared/lib/termsApi';
import type { ActiveTerm, TermsCategory } from '../../../shared/types/content';
import { useAppContext } from '../../../state/app/useAppContext';

type CheckedTerms = Record<string, boolean>;
const signupTermsCategories: TermsCategory[] = ['SIGNUP', 'SECURITY', 'MARKETING'];

function createCheckedTermsMap(terms: ActiveTerm[], checked: boolean) {
  return terms.reduce<CheckedTerms>((accumulator, term) => {
    accumulator[term.termsId] = checked;
    return accumulator;
  }, {});
}

export function TermsScreen() {
  const navigate = useNavigate();
  const { signupToken } = useAppContext();
  const [activeTerms, setActiveTerms] = useState<ActiveTerm[]>([]);
  const [checkedTerms, setCheckedTerms] = useState<CheckedTerms>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<ActiveTerm | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadTerms = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const terms = await fetchActiveTerms(signupTermsCategories);
        if (cancelled) {
          return;
        }

        setActiveTerms(terms);
        setCheckedTerms((current) => {
          const next: CheckedTerms = {};
          for (const term of terms) {
            next[term.termsId] = current[term.termsId] ?? false;
          }
          return next;
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          getActionErrorMessage(error, '약관 목록을 불러오지 못했습니다. 다시 시도해 주세요.'),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTerms();

    return () => {
      cancelled = true;
    };
  }, [reloadIndex]);

  const requiredTerms = activeTerms.filter((term) => term.requiredType === 'REQUIRED');
  const requiredChecked =
    activeTerms.length > 0 &&
    requiredTerms.every((term) => checkedTerms[term.termsId] === true);

  const handleToggleAll = (checked: boolean) => {
    setCheckedTerms(createCheckedTermsMap(activeTerms, checked));
  };

  const handleToggleTerm = (termsId: string) => {
    setCheckedTerms((current) => ({
      ...current,
      [termsId]: !current[termsId],
    }));
  };

  const handleContinue = async () => {
    if (!requiredChecked) {
      return;
    }

    if (!signupToken) {
      setErrorMessage('회원가입 토큰이 없어 약관 동의를 저장할 수 없습니다. 소셜 로그인을 다시 시도해 주세요.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const agreements = activeTerms.map((term) => ({
        termsId: term.termsId,
        agreed: checkedTerms[term.termsId] === true,
      }));
      await submitSignupTerms(signupToken, agreements);
      navigate('/auth/verify');
    } catch (error) {
      setErrorMessage(
        getActionErrorMessage(error, '약관 동의 저장에 실패했습니다. 다시 시도해 주세요.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TermsView
      terms={activeTerms}
      checkedTerms={checkedTerms}
      loading={loading}
      submitting={submitting}
      errorMessage={errorMessage}
      selectedTerm={selectedTerm}
      onBack={() => navigate(-1)}
      onRetry={() => setReloadIndex((current) => current + 1)}
      onToggleAll={handleToggleAll}
      onToggleTerm={handleToggleTerm}
      onOpenTerm={setSelectedTerm}
      onCloseTerm={() => setSelectedTerm(null)}
      onContinue={handleContinue}
    />
  );
}
