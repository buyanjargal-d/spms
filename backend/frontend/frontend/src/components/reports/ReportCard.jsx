import { Calendar, TrendingUp, User, Users, BarChart } from 'lucide-react';
import Card from '../common/Card';

const iconMap = {
  Calendar,
  TrendingUp,
  User,
  Users,
  BarChart,
};

const ReportCard = ({ report, onClick }) => {
  const IconComponent = iconMap[report.icon] || BarChart;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-blue-300"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <IconComponent className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mt-2">{report.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
            Тайлан үзэх →
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ReportCard;
