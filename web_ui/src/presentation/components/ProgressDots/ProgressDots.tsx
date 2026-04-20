interface ProgressDotsProps {
  total: number;
  activeIndex: number;
}

export function ProgressDots({ total, activeIndex }: ProgressDotsProps) {
  return (
    <div className="progress-dots" aria-label="screen progress">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`progress-dots__item ${index === activeIndex ? 'progress-dots__item--active' : ''}`.trim()}
        />
      ))}
    </div>
  );
}
