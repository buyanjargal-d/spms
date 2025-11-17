import { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';
import { Calendar, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

const MonthlyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getMonthlyReport(selectedYear, selectedMonth);
      setReport(response.data || response);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      toast.error('Сарын тайлан татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
    '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Тайлан олдсонгүй</p>
        </div>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Нийт хүсэлт',
      value: report.totalRequests || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Амжилттай',
      value: report.completedRequests || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Хүлээгдэж буй',
      value: report.pendingRequests || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Амжилтын хувь',
      value: report.totalRequests > 0
        ? `${Math.round((report.completedRequests / report.totalRequests) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Хугацаа сонгох:</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm" onClick={fetchReport}>
              Шинэчлэх
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily Breakdown */}
      {report.dailyBreakdown && report.dailyBreakdown.length > 0 && (
        <Card title="Өдөр бүрийн нэгтгэл">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Огноо
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Нийт
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Амжилттай
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Хүлээгдэж буй
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Цуцлагдсан
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.dailyBreakdown.map((day) => (
                  <tr key={day.date} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString('mn-MN', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {day.total || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-600">
                      {day.completed || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-yellow-600">
                      {day.pending || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-red-600">
                      {day.rejected || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Class Breakdown */}
      {report.classSummary && report.classSummary.length > 0 && (
        <Card title="Ангиар ангилсан">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Анги
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Нийт хүсэлт
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Амжилттай
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Амжилтын хувь
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.classSummary.map((cls) => (
                  <tr key={cls.className} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {cls.className}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cls.totalRequests || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-600">
                      {cls.completedRequests || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cls.totalRequests > 0
                        ? `${Math.round((cls.completedRequests / cls.totalRequests) * 100)}%`
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MonthlyReport;
