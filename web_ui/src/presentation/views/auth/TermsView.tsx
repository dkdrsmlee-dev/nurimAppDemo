import type { ActiveTerm } from '../../../shared/types/content';
import { Button } from '../../components/Button/Button';
import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';

interface TermsViewProps {
  terms: ActiveTerm[];
  checkedTerms: Record<string, boolean>;
  loading: boolean;
  submitting: boolean;
  errorMessage: string;
  selectedTerm: ActiveTerm | null;
  onBack: () => void;
  onRetry: () => void;
  onToggleAll: (checked: boolean) => void;
  onToggleTerm: (termsId: string) => void;
  onOpenTerm: (term: ActiveTerm) => void;
  onCloseTerm: () => void;
  onContinue: () => void;
}

function getRequiredLabel(requiredType: string) {
  return requiredType === 'REQUIRED' ? '[필수]' : '[선택]';
}

function getSummary(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return '약관 상세 내용을 확인해 주세요.';
  }

  return normalized.length > 72 ? `${normalized.slice(0, 72)}...` : normalized;
}

export function TermsView({
  terms,
  checkedTerms,
  loading,
  submitting,
  errorMessage,
  selectedTerm,
  onBack,
  onRetry,
  onToggleAll,
  onToggleTerm,
  onOpenTerm,
  onCloseTerm,
  onContinue,
}: TermsViewProps) {
  const allChecked = terms.length > 0 && terms.every((term) => checkedTerms[term.termsId] === true);
  const requiredChecked =
    terms.length > 0 &&
    terms
      .filter((term) => term.requiredType === 'REQUIRED')
      .every((term) => checkedTerms[term.termsId] === true);

  return (
    <PhoneViewport
      footer={
        <Button disabled={loading || submitting || !requiredChecked} onClick={onContinue}>
          {submitting ? '약관 저장 중...' : '본인인증 진행하기'}
        </Button>
      }
    >
      <div className="screen-content">
        <div className="page-header">
          <span className="page-header__back" onClick={onBack}>
            ‹
          </span>
          <span>서비스 약관동의</span>
        </div>
        <div className="terms-panel">
          <div className="check-row check-row--all">
            <button type="button" className="check-row__toggle" onClick={() => onToggleAll(!allChecked)}>
              <span className={`check-row__mark ${allChecked ? 'check-row__mark--checked' : ''}`.trim()}>✓</span>
            </button>
            <button type="button" className="check-row__content check-row__content--all" onClick={() => onToggleAll(!allChecked)}>
              <span>약관 전체 동의</span>
            </button>
          </div>
          {errorMessage ? (
            <div className="terms-feedback">
              <p className="action-error">{errorMessage}</p>
              <Button variant="secondary" fullWidth={false} onClick={onRetry}>
                다시 시도
              </Button>
            </div>
          ) : null}
          {loading ? (
            <div className="terms-loading">약관 목록을 불러오는 중입니다.</div>
          ) : terms.length === 0 ? (
            <div className="terms-loading">활성화된 약관이 없습니다.</div>
          ) : (
            <div className="terms-list">
              {terms.map((term) => (
                <div key={term.termsId} className="check-row">
                  <button type="button" className="check-row__toggle" onClick={() => onToggleTerm(term.termsId)}>
                    <span className={`check-row__mark ${checkedTerms[term.termsId] ? 'check-row__mark--checked' : ''}`.trim()}>
                      ✓
                    </span>
                  </button>
                  <button type="button" className="check-row__content" onClick={() => onOpenTerm(term)}>
                    <span className="check-row__body">
                      <strong>{`${getRequiredLabel(term.requiredType)} ${term.termsNm}`}</strong>
                      <small>{getSummary(term.content)}</small>
                    </span>
                  </button>
                  <button type="button" className="check-row__detail" onClick={() => onOpenTerm(term)}>
                    <span className="check-row__arrow">›</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedTerm ? (
        <div className="term-detail" role="dialog" aria-modal="true">
          <div className="term-detail__sheet">
            <div className="term-detail__header">
              <strong>{`${getRequiredLabel(selectedTerm.requiredType)} ${selectedTerm.termsNm}`}</strong>
              <button type="button" className="term-detail__close" onClick={onCloseTerm}>
                ×
              </button>
            </div>
            <div className="term-detail__content">{selectedTerm.content || '약관 본문이 아직 등록되지 않았습니다.'}</div>
          </div>
          <button type="button" className="term-detail__backdrop" aria-label="닫기" onClick={onCloseTerm} />
        </div>
      ) : null}
    </PhoneViewport>
  );
}
