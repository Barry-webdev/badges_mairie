import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary: 'bg-blue-900 hover:bg-blue-800 text-white shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
  ghost: 'hover:bg-gray-100 text-gray-700',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
};

const sizes: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 
        ${variants[variant]} ${sizes[size]} 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
