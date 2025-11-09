import PropTypes from 'prop-types';

const RoleCard = ({ role, icon: Icon, title, description, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(role)}
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-200
        hover:shadow-lg hover:scale-105 active:scale-95
        flex flex-col items-center text-center gap-3
        ${
          selected
            ? 'border-primary-600 bg-primary-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-primary-300'
        }
      `}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      )}

      {/* Icon */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          ${selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}
        `}
      >
        <Icon className="w-8 h-8" />
      </div>

      {/* Title */}
      <h3
        className={`
          text-lg font-semibold
          ${selected ? 'text-primary-900' : 'text-gray-900'}
        `}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`
          text-sm
          ${selected ? 'text-primary-700' : 'text-gray-600'}
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
