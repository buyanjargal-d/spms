import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, QrCode, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { guardService } from '../../services/guardService';

const QueuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch queue
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await guardService.getQueue();
      if (response.success) {
        setQueue(response.data.queue || []);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await guardService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchQueue();
    fetchStats();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchQueue();
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    fetchQueue();
    fetchStats();
  };

  const handleVerify = (pickupId) => {
    navigate(`/guard/verify?pickupId=${pickupId}`);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWaitingTimeColor = (minutes) => {
    if (minutes < 5) return 'text-green-600';
    if (minutes < 15) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Авалтын дараалал</h1>
          <p className="mt-1 text-sm text-gray-600">
            Батлагдсан хүсэлтүүдийн бодит цагийн дараалал
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Шинэчлэх
          </Button>
          <Button
            variant={autoRefresh ? 'primary' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Авто шинэчлэх асаалттай' : 'Авто шинэчлэх унтраалттай'}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Дараалалд</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pendingQueue || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Өнөөдөр дууссан</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedToday || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Яаралтай</p>
              <p className="text-3xl font-bold text-red-600">{stats.emergencyToday || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Нийт боловсруулсан</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProcessed || 0}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Queue List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Батлагдсан хүсэлтүүд</h2>

          {loading && queue.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Уншиж байна...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Одоогоор дараалалд хүсэлт байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 mb-2">
                        {item.studentPhoto ? (
                          <img
                            src={item.studentPhoto}
                            alt={item.studentName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.studentName}</h3>
                          <p className="text-sm text-gray-600">Анги: {item.className}</p>
                        </div>
                      </div>

                      {/* Authorized Person */}
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          Авагч: {item.authorizedPersonName}
                        </span>
                      </div>

                      {/* Time Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatDateTime(item.requestedTime)}
                          </span>
                        </div>
                        <div className={`font-semibold ${getWaitingTimeColor(item.waitingTime)}`}>
                          Хүлээсэн: {item.waitingTime} минут
                        </div>
                        {getRequestTypeBadge(item.requestType)}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleVerify(item.id)}
                      size="sm"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Баталгаажуулах
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm">Автоматаар шинэчилж байна</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueuePage;
