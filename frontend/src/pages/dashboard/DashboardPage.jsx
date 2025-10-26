import { Users, ClipboardCheck, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const DashboardPage = () => {
  // Mock data - Replace with real API calls
  const stats = [
    {
      name: 'Нийт сурагч',
      value: '245',
      icon: Users,
      change: '+12',
      changeType: 'increase',
      color: 'bg-blue-500',
    },
    {
      name: 'Хүлээгдэж буй',
      value: '8',
      icon: Clock,
      change: '+3',
      changeType: 'increase',
      color: 'bg-yellow-500',
    },
    {
      name: 'Баталгаажсан',
      value: '15',
      icon: ClipboardCheck,
      change: '+5',
      changeType: 'increase',
      color: 'bg-green-500',
    },
    {
      name: 'Дууссан',
      value: '132',
      icon: CheckCircle,
      change: '+18',
      changeType: 'increase',
      color: 'bg-purple-500',
    },
  ];

  const recentPickups = [
    {
      id: 1,
      studentName: 'Төмөр Баярын',
      guardianName: 'Баяр эцэг',
      time: '14:30',
      status: 'completed',
      className: '5-A',
    },
    {
      id: 2,
      studentName: 'Сайхан Болдын',
      guardianName: 'Болд эх',
      time: '14:45',
      status: 'pending',
      className: '3-B',
    },
    {
      id: 3,
      studentName: 'Болор Дорж',
      guardianName: 'Дорж эцэг',
      time: '15:00',
      status: 'approved',
      className: '5-A',
    },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { variant: 'success', label: 'Дууссан' },
      pending: { variant: 'warning', label: 'Хүлээгдэж буй' },
      approved: { variant: 'info', label: 'Баталгаажсан' },
      rejected: { variant: 'danger', label: 'Татгалзсан' },
    };
    
    const { variant, label } = statusMap[status] || statusMap.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Хяналтын самбар</h1>
        <p className="text-gray-600 mt-1">
          Өнөөдрийн тойм мэдээлэл
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="text-green-600 font-medium">
                      {stat.change}
                    </span>{' '}
                    энэ долоо хоног
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent pickups */}
      <Card title="Сүүлийн хүсэлтүүд">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
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
                  Цаг
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Төлөв
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPickups.map((pickup) => (
                <tr key={pickup.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {pickup.studentName}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {pickup.className}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">
                      {pickup.guardianName}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{pickup.time}</p>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(pickup.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
