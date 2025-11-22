import clsx from 'clsx';

const Card = ({ children, className = '', title, actions, variant = 'default' }) => {
  const variants = {
    default: 'bg-card border-light shadow-sm hover:shadow-md',
    highlighted: 'bg-primary-50 border-primary-300 border-l-4 border-l-primary-500',
    yellow: 'bg-primary-50 border-primary-200',
  };

  return (
    <div className={clsx(
      'rounded-lg border p-6 transition-all duration-200',
      variants[variant],
      className
    )}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-primary">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
