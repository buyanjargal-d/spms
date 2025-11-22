import clsx from 'clsx';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

const Badge = ({ children, variant = 'info', className = '', showIcon = true }) => {
  const variants = {
    success: 'bg-success-100 text-success-800 border-success-300',
    warning: 'bg-primary-100 text-primary-800 border-primary-300',
    danger: 'bg-danger-100 text-danger-800 border-danger-300',
    info: 'bg-info-50 text-info-800 border-info-300',
    pending: 'bg-primary-50 text-primary-900 border-primary-200',
  };

  const icons = {
    success: CheckCircle2,
    warning: AlertCircle,
    danger: XCircle,
    info: Info,
    pending: AlertCircle,
  };

  const Icon = icons[variant];

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variants[variant],
      className
    )}>
      {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
};

export default Badge;
