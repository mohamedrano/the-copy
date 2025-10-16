
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ children, variant = 'primary', icon, className, ...props }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantClasses = "";
  switch (variant) {
    case 'primary':
      variantClasses = "bg-primary hover:bg-primary-light text-slate-900 focus:ring-primary";
      break;
    case 'secondary':
      variantClasses = "bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500";
      break;
    case 'danger':
      variantClasses = "bg-red-600 hover:bg-red-500 text-white focus:ring-red-400";
      break;
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      data-testid="submit-button"
      {...props}
    >
      {icon && <span className="me-2">{icon}</span>}
      {children}
    </button>
  );
};
