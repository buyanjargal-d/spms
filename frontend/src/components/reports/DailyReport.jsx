import { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';
import { Calendar, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const DailyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, [selectedDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getDailyReport(selectedDate);
      setReport(response.data || response);
    } catch (error) {
      console.error('Error fetching daily report:', error);
      toast.error('Өдрийн тайлан татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

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
      label: 'Цуцлагдсан',
      value: report.rejectedRequests || 0,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label htmlFor="report-date" className="text-sm font-medium text-gray-700">
              Огноо сонгох:
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="report-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
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

      {/* Pickup List */}
      <Card title="Өдрийн авалтын жагсаалт">
        {report.pickups && report.pickups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Цаг
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Сурагч
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Анги
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Авагч
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Төлөв
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.pickups.map((pickup) => (
                  <tr key={pickup.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(pickup.requestedTime).toLocaleTimeString('mn-MN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {pickup.student?.lastName} {pickup.student?.firstName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {pickup.student?.class
                        ? `${pickup.student.class.gradeLevel}-${pickup.student.class.section}`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {pickup.requester?.fullName || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pickup.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : pickup.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pickup.status === 'completed'
                          ? 'Дууссан'
                          : pickup.status === 'pending'
                          ? 'Хүлээгдэж буй'
                          : 'Цуцлагдсан'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Энэ өдөр авалт олдсонгүй</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DailyReport;
