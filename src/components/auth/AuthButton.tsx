import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  loading = false,
  children,
  className = ''
}) => {
  const baseStyles = "w-full font-bold py-4 rounded-xl transition-all duration-300 relative overflow-hidden group transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: variant === 'primary' && type === 'submit' 
      ? "bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 border-0"
      : "bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 hover:from-indigo-500 hover:via-purple-400 hover:to-pink-500 text-white shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 border-0",
    secondary: "bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/10 text-white backdrop-blur-sm"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{
        background: variant === 'primary' 
          ? (type === 'submit' 
              ? 'linear-gradient(to right, #9333ea, #a855f7, #2563eb)' 
              : 'linear-gradient(to right, #4f46e5, #a855f7, #ec4899)')
          : undefined
      }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      
      {/* Content */}
      <div className="flex items-center justify-center space-x-3 relative z-10">
        {loading && <Loader2 className="w-6 h-6 animate-spin" />}
        <span className="text-lg">{children}</span>
      </div>
    </button>
  );
};