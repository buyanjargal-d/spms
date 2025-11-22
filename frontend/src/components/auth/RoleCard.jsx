import PropTypes from 'prop-types';
import { CheckCircle2 } from 'lucide-react';

const RoleCard = ({ role, icon: Icon, title, description, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(role)}
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-300
        hover:shadow-xl hover:scale-105 active:scale-95
        flex flex-col items-center text-center gap-3
        ${
          selected
            ? 'border-primary-500 bg-primary-100 shadow-lg ring-2 ring-primary-300'
            : 'border-primary-200 bg-white hover:border-primary-400 hover:bg-primary-50'
        }
      `}
    >
      {selected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-6 h-6 text-primary-600" />
        </div>
      )}

      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
          ${selected ? 'bg-primary-500 text-white shadow-md' : 'bg-primary-100 text-primary-700'}
        `}
      >
        <Icon className="w-8 h-8" />
      </div>

      <h3
        className={`
          text-lg font-semibold
          ${selected ? 'text-primary-900' : 'text-primary-800'}
        `}
      >
        {title}
      </h3>

      <p
        className={`
          text-sm
          ${selected ? 'text-primary-800' : 'text-secondary'}
        `}
      >
        {description}
      </p>
    </button>
  );
};

RoleCard.propTypes = {
  role: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default RoleCard;
