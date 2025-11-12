import PropTypes from 'prop-types';
import { FileText, Calendar, BarChart3, Users } from 'lucide-react';

const ReportCard = ({ report, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'daily':
        return <Calendar className="w-8 h-8" />;
      case 'monthly':
        return <BarChart3 className="w-8 h-8" />;
      case 'student_history':
        return <Users className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-400"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg text-blue-600">
          {getIcon(report.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {report.name}
          </h3>
          <p className="text-sm text-gray-600">
            {report.description}
          </p>
        </div>
      </div>
    </div>
  );
};

ReportCard.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ReportCard;
