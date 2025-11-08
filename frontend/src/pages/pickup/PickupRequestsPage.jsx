import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { pickupService } from '../../services/pickupService';
import toast from 'react-hot-toast';

const PickupRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPickupRequests = async () => {
      try {
        setLoading(true);
        const response = await pickupService.getAllRequests();
        console.log('Pickup requests API response:', response);

        // Handle different response formats
        const requestsData = response.data || response.pickupRequests || response;
        const allRequests = Array.isArray(requestsData) ? requestsData : [];

        // Filter only pending requests
        const pendingRequests = allRequests.filter(req => req.status === 'pending');
        setRequests(pendingRequests);
      } catch (error) {
        console.error('Error fetching pickup requests:', error);
        toast.error('Хүсэлтүүдийн мэдээлэл татахад алдаа гарлаа');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPickupRequests();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Хүлээгдэж буй' },
      approved: { variant: 'info', label: 'Баталгаажсан' },
      completed: { variant: 'success', label: 'Дууссан' },
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
      <h1 className="text-2xl font-bold text-gray-900">Авах хүсэлтүүд</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Сурагч</th>
                <th className="text-left py-3 px-4">Авагч</th>
                <th className="text-left py-3 px-4">Цаг</th>
                <th className="text-left py-3 px-4">Төлөв</th>
                <th className="text-left py-3 px-4">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    Хүлээгдэж буй хүсэлт олдсонгүй
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {req.student?.first_name || req.student_id || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">
                        {req.requester?.full_name || req.requester_id || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {req.requested_time ? new Date(req.requested_time).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm">Батлах</Button>
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

export default PickupRequestsPage;
