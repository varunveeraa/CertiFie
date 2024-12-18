import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  isLoading,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700', // Destructive variant
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">⚪</span>
      ) : Icon ? (
        <Icon className="w-5 h-5 mr-2" />
      ) : null}
      {children}
    </button>
  );
}
