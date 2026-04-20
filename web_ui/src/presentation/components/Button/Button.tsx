import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  fullWidth = true,
  type = 'button',
  ...rest
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${fullWidth ? 'button--full' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
