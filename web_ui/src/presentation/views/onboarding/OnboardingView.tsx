import { useState } from 'react';

import type { OnboardingSlide } from '../../../shared/types/content';
import { Button } from '../../components/Button/Button';
import { PhoneViewport } from '../../components/PhoneViewport/PhoneViewport';
import { ProgressDots } from '../../components/ProgressDots/ProgressDots';

interface OnboardingViewProps {
  slides: OnboardingSlide[];
  onComplete: () => void;
}

export function OnboardingView({ slides, onComplete }: OnboardingViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slide = slides[activeIndex];

  const moveNext = () => {
    if (activeIndex < slides.length - 1) {
      setActiveIndex((current) => current + 1);
      return;
    }

    onComplete();
  };

  return (
    <PhoneViewport
      footer={
        <>
          <ProgressDots total={slides.length} activeIndex={activeIndex} />
          <div className="footer-actions">
            <Button variant="ghost" fullWidth={false} onClick={onComplete}>
              건너뛰기
            </Button>
            <Button onClick={moveNext}>{activeIndex === slides.length - 1 ? '서비스 시작하기' : '다음'}</Button>
          </div>
        </>
      }
    >
      <div className="screen-content onboarding-screen">
        <div className="feature-card">
          <div className="feature-card__eyebrow">{slide.eyebrow}</div>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>
        </div>
        <div className="hero-preview">
          <div className="hero-preview__box hero-preview__box--top" />
          <div className="hero-preview__box hero-preview__box--middle" />
          <div className="hero-preview__box hero-preview__box--bottom" />
        </div>
      </div>
    </PhoneViewport>
  );
}
