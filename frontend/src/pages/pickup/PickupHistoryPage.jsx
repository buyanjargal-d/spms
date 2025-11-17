import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { pickupService } from '../../services/pickupService';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';
import { Calendar, Search, Filter, User, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PickupHistoryPage = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [filteredPickups, setFilteredPickups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchHistoryData();
  }, []);

  useEffect(() => {
    filterPickups();
  }, [pickups, searchTerm, statusFilter, dateFilter]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);

      // Fetch all pickup requests
      const pickupsResponse = await pickupService.getAllRequests();
      const pickupsData = pickupsResponse.data || pickupsResponse.pickupRequests || pickupsResponse || [];

      // Sort by date descending (newest first)
      const sortedPickups = (Array.isArray(pickupsData) ? pickupsData : [])
        .sort((a, b) => new Date(b.requestedTime || b.created_at) - new Date(a.requestedTime || a.created_at));

      setPickups(sortedPickups);

      // Fetch students for display names
      if (user?.role === 'admin') {
        const studentsResponse = await studentService.getAllStudents();
        const studentsData = studentsResponse.data || studentsResponse.students || studentsResponse || [];
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Түүх татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const filterPickups = () => {
    let filtered = [...pickups];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      filtered = filtered.filter(p => {
        const pickupDate = new Date(p.requestedTime || p.created_at);
        pickupDate.setHours(0, 0, 0, 0);
        return pickupDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(p => {
        const pickupDate = new Date(p.requestedTime || p.created_at);
        return pickupDate >= weekAgo;
      });
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(p => {
        const pickupDate = new Date(p.requestedTime || p.created_at);
        return pickupDate >= monthAgo;
      });
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        const studentName = p.student?.firstName || p.student?.lastName || '';
        const requesterName = p.requester?.fullName || '';
        const studentCode = p.student?.studentCode || '';
        return (
          studentName.toLowerCase().includes(searchLower) ||
          requesterName.toLowerCase().includes(searchLower) ||
          studentCode.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredPickups(filtered);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { variant: 'success', label: 'Дууссан' },
      pending: { variant: 'warning', label: 'Хүлээгдэж буй' },
      approved: { variant: 'info', label: 'Баталгаажсан' },
      rejected: { variant: 'danger', label: 'Татгалзсан' },
      cancelled: { variant: 'secondary', label: 'Цуцлагдсан' },
    };

    const { variant, label } = statusMap[status] || statusMap.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('mn-MN', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Авалтын түүх</h1>
        <p className="text-gray-600 mt-1">Өнгөрсөн авалтын бүртгэл</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Нийт</p>
              <p className="text-xl font-bold text-gray-900">{pickups.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Дууссан</p>
              <p className="text-xl font-bold text-gray-900">
                {pickups.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Хүлээгдэж буй</p>
              <p className="text-xl font-bold text-gray-900">
                {pickups.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Цуцлагдсан</p>
              <p className="text-xl font-bold text-gray-900">
                {pickups.filter(p => p.status === 'cancelled' || p.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Сурагч, авагч хайх..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Бүх төлөв</option>
            <option value="completed">Дууссан</option>
            <option value="approved">Баталгаажсан</option>
            <option value="pending">Хүлээгдэж буй</option>
            <option value="rejected">Татгалзсан</option>
            <option value="cancelled">Цуцлагдсан</option>
          </select>

          {/* Date Filter */}
          <select
            className="input-field"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Бүх хугацаа</option>
            <option value="today">Өнөөдөр</option>
            <option value="week">Сүүлийн 7 хоног</option>
            <option value="month">Сүүлийн сар</option>
          </select>
        </div>
      </Card>

      {/* History Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Түүх ({filteredPickups.length})
          </h2>
          <Button variant="secondary" size="sm" onClick={fetchHistoryData}>
            Шинэчлэх
          </Button>
        </div>

        {filteredPickups.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {pickups.length === 0 ? 'Түүх олдсонгүй' : 'Хайлтын үр дүн олдсонгүй'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Огноо
                  </th>
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
                    Төрөл
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Төлөв
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPickups.map((pickup) => (
                  <tr key={pickup.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(pickup.requestedTime)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatTime(pickup.requestedTime)}
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
                      {pickup.requester?.fullName || pickup.pickupPerson?.fullName || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                      {pickup.requestType || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(pickup.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PickupHistoryPage;
