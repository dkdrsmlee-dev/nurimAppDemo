import type { PropsWithChildren, ReactNode } from 'react';

interface PhoneViewportProps extends PropsWithChildren {
  footer?: ReactNode;
  className?: string;
}

export function PhoneViewport({ children, footer, className = '' }: PhoneViewportProps) {
  return (
    <div className="app-stage">
      <div className={`phone-viewport ${className}`.trim()}>
        <div className="phone-body">{children}</div>
        {footer ? <div className="phone-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
