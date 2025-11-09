import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Plus, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { parentService } from '../../services/parentService';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch parent's requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const filters = filter !== 'all' ? { status: filter } : {};
        const response = await parentService.getMyRequests(filters);
        const requestsData = response.data || [];
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Хүлээгдэж буй', icon: Clock },
      approved: { variant: 'info', label: 'Баталгаажсан', icon: CheckCircle },
      rejected: { variant: 'danger', label: 'Татгалзсан', icon: XCircle },
      completed: { variant: 'success', label: 'Дууссан', icon: CheckCircle },
      cancelled: { variant: 'secondary', label: 'Цуцлагдсан', icon: XCircle },
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 inline mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPickupTypeLabel = (type) => {
    const typeMap = {
      parent: 'Эцэг эх',
      guest: 'Зочин авагч',
    };
    return typeMap[type] || type;
  };

  const getRequestTypeLabel = (type) => {
    const typeMap = {
      standard: 'Энгийн',
      advance: 'Урьдчилсан',
      guest: 'Зочин',
    };
    return typeMap[type] || type;
  };

  const getRequestTypeBadge = (type) => {
    const typeMap = {
      standard: { variant: 'info', label: 'Энгийн' },
      advance: { variant: 'warning', label: 'Урьдчилсан' },
      guest: { variant: 'secondary', label: 'Зочин' },
    };

    const config = typeMap[type] || typeMap.standard;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Миний хүсэлтүүд</h1>
          <p className="text-gray-600 mt-1">
            Нийт {stats.total} хүсэлт
          </p>
        </div>
        <Button
          onClick={() => navigate('/pickup/create')}
          icon={Plus}
        >
          Шинэ хүсэлт
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Нийт</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Хүлээгдэж буй</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Баталгаажсан</p>
              <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Дууссан</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Шүүлтүүр:</span>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Бүгд' },
              { value: 'pending', label: 'Хүлээгдэж буй' },
              { value: 'approved', label: 'Баталгаажсан' },
              { value: 'completed', label: 'Дууссан' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests table */}
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
                  Хүсэлтийн төрөл
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Авагч
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Хүссэн цаг
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Төлөв
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {filter === 'all'
                        ? 'Хүсэлт байхгүй байна'
                        : 'Энэ төлөвтэй хүсэлт олдсонгүй'}
                    </p>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {request.student?.firstName} {request.student?.lastName}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {request.student?.class?.name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getRequestTypeBadge(request.requestType || 'standard')}
                      {request.requestType === 'advance' && request.scheduledPickupTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          Товлосон: {formatDateTime(request.scheduledPickupTime)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">
                        {request.pickupPerson?.fullName || 'Өөрөө'}
                      </p>
                      {request.pickupType === 'guest' && (
                        <span className="text-xs text-gray-500">(Зочин)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {formatDateTime(request.requestedTime)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(request.status)}
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

export default MyRequestsPage;
