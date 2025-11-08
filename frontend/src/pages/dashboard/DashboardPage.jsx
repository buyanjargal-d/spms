import { useState, useEffect } from 'react';
import { Users, ClipboardCheck, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { pickupService } from '../../services/pickupService';
import { studentService } from '../../services/studentService';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentPickups, setRecentPickups] = useState([]);

  // Define role-specific stats
  const getStatsByRole = () => {
    const commonStats = [
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

    if (user?.role === 'admin') {
      return [
        {
          name: 'Нийт сурагч',
          value: '245',
          icon: Users,
          change: '+12',
          changeType: 'increase',
          color: 'bg-blue-500',
        },
        ...commonStats,
      ];
    } else if (user?.role === 'teacher') {
      return [
        {
          name: 'Миний анги',
          value: '28',
          icon: Users,
          change: '+0',
          changeType: 'neutral',
          color: 'bg-blue-500',
        },
        ...commonStats,
      ];
    } else if (user?.role === 'parent') {
      return [
        {
          name: 'Миний хүүхдүүд',
          value: '2',
          icon: Users,
          change: '+0',
          changeType: 'neutral',
          color: 'bg-blue-500',
        },
        {
          name: 'Миний хүсэлтүүд',
          value: '5',
          icon: ClipboardCheck,
          change: '+2',
          changeType: 'increase',
          color: 'bg-green-500',
        },
        {
          name: 'Хүлээгдэж буй',
          value: '1',
          icon: Clock,
          change: '+1',
          changeType: 'increase',
          color: 'bg-yellow-500',
        },
      ];
    } else if (user?.role === 'guard') {
      return commonStats;
    }

    return commonStats;
  };

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch pickup requests
        const pickupsResponse = await pickupService.getAllPickupRequests();
        const pickups = pickupsResponse.data || pickupsResponse.pickupRequests || pickupsResponse || [];

        // Calculate real statistics
        const pending = pickups.filter(p => p.status === 'pending').length;
        const approved = pickups.filter(p => p.status === 'approved').length;
        const completed = pickups.filter(p => p.status === 'completed').length;

        // Get recent pickups (last 5)
        const recent = (Array.isArray(pickups) ? pickups : [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setRecentPickups(recent);

        // Build role-specific stats with real data
        let roleStats = [];

        if (user?.role === 'admin') {
          // Fetch student count for admin
          const studentsResponse = await studentService.getAllStudents();
          const students = studentsResponse.data || studentsResponse.students || studentsResponse || [];
          const studentCount = Array.isArray(students) ? students.length : 0;

          roleStats = [
            {
              name: 'Нийт сурагч',
              value: studentCount.toString(),
              icon: Users,
              change: '+0',
              changeType: 'neutral',
              color: 'bg-blue-500',
            },
            {
              name: 'Хүлээгдэж буй',
              value: pending.toString(),
              icon: Clock,
              change: '+0',
              changeType: 'neutral',
              color: 'bg-yellow-500',
            },
            {
              name: 'Баталгаажсан',
              value: approved.toString(),
              icon: ClipboardCheck,
              change: '+0',
              changeType: 'neutral',
              color: 'bg-green-500',
            },
            {
              name: 'Дууссан',
              value: completed.toString(),
              icon: CheckCircle,
              change: '+0',
              changeType: 'neutral',
              color: 'bg-purple-500',
            },
          ];
        } else {
          roleStats = getStatsByRole();
          // Update with real counts where possible
          roleStats = roleStats.map(stat => {
            if (stat.name === 'Хүлээгдэж буй') {
              return { ...stat, value: pending.toString() };
            } else if (stat.name === 'Баталгаажсан') {
              return { ...stat, value: approved.toString() };
            } else if (stat.name === 'Дууссан') {
              return { ...stat, value: completed.toString() };
            }
            return stat;
          });
        }

        setStats(roleStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to role-based mock stats
        setStats(getStatsByRole());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

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
              {recentPickups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    Хүсэлт олдсонгүй
                  </td>
                </tr>
              ) : (
                recentPickups.map((pickup) => (
                  <tr key={pickup.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {pickup.student?.first_name || pickup.student_id || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {pickup.student?.class_id || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">
                        {pickup.requester?.full_name || pickup.requester_id || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {pickup.requested_time ? new Date(pickup.requested_time).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(pickup.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
