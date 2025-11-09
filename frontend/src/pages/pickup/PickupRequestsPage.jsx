import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import RejectRequestModal from '../../components/pickup/RejectRequestModal';
import BulkActionsToolbar from '../../components/pickup/BulkActionsToolbar';
import RequestFilters from '../../components/pickup/RequestFilters';
import { pickupService } from '../../services/pickupService';
import toast from 'react-hot-toast';

const PickupRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    date: 'all',
    pickupType: 'all',
    search: '',
  });
  const [allRequests, setAllRequests] = useState([]);

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      const response = await pickupService.getAllRequests();
      console.log('Pickup requests API response:', response);

      // Handle different response formats
      const requestsData = response.data || response.pickupRequests || response;
      const fetchedRequests = Array.isArray(requestsData) ? requestsData : [];

      setAllRequests(fetchedRequests);
      // Apply current filters
      applyFilters(fetchedRequests, filters);
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
      toast.error('Хүсэлтүүдийн мэдээлэл татахад алдаа гарлаа');
      setAllRequests([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, currentFilters) => {
    let filtered = [...data];

    // Status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(req => req.status === currentFilters.status);
    }

    // Date filter
    if (currentFilters.date !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (currentFilters.date) {
        case 'today':
          filtered = filtered.filter(req => {
            const reqDate = new Date(req.requestedTime);
            return reqDate >= today && reqDate < new Date(today.getTime() + 86400000);
          });
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          filtered = filtered.filter(req => {
            const reqDate = new Date(req.requestedTime);
            return reqDate >= weekStart;
          });
          break;
        case 'this_month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter(req => {
            const reqDate = new Date(req.requestedTime);
            return reqDate >= monthStart;
          });
          break;
      }
    }

    // Pickup type filter
    if (currentFilters.pickupType !== 'all') {
      filtered = filtered.filter(req => req.requestType === currentFilters.pickupType);
    }

    // Search filter
    if (currentFilters.search.trim()) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(req => {
        const studentName = `${req.student?.firstName || ''} ${req.student?.lastName || ''}`.toLowerCase();
        return studentName.includes(searchLower);
      });
    }

    setRequests(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(allRequests, newFilters);
    // Clear selection when filters change
    setSelectedIds([]);
  };

  useEffect(() => {
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

  const handleApprove = async (requestId) => {
    try {
      setApproving(requestId);
      await pickupService.approveRequest(requestId, {
        approvedAt: new Date().toISOString(),
      });
      toast.success('Хүсэлт амжилттай баталгаажлаа');
      // Refresh the list
      fetchPickupRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(
        'Хүсэлт баталгаажуулахад алдаа гарлаа: ' +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setApproving(null);
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (rejectionReason) => {
    try {
      setRejecting(true);
      await pickupService.rejectRequest(selectedRequest.id, {
        rejectionReason,
        rejectedAt: new Date().toISOString(),
      });
      toast.success('Хүсэлт татгалзагдлаа');
      setRejectModalOpen(false);
      setSelectedRequest(null);
      // Refresh the list
      fetchPickupRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(
        'Хүсэлт татгалзахад алдаа гарлаа: ' +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setRejecting(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectModalOpen(false);
    setSelectedRequest(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(requests.map(req => req.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (requestId) => {
    if (selectedIds.includes(requestId)) {
      setSelectedIds(selectedIds.filter(id => id !== requestId));
    } else {
      setSelectedIds([...selectedIds, requestId]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    // Confirmation
    const confirmMessage = `${selectedIds.length} хүсэлтийг баталгаажуулахдаа итгэлтэй байна уу?`;
    if (!window.confirm(confirmMessage)) return;

    setBulkApproving(true);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Approve each request sequentially
      for (const requestId of selectedIds) {
        try {
          await pickupService.approveRequest(requestId, {
            approvedAt: new Date().toISOString(),
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            requestId,
            error: error.response?.data?.message || error.message,
          });
        }
      }

      // Show results
      if (results.failed === 0) {
        toast.success(`${results.success} хүсэлт амжилттай баталгаажлаа`);
      } else if (results.success === 0) {
        toast.error(`Бүх хүсэлт амжилтгүй боллоо`);
      } else {
        toast.success(
          `${results.success} хүсэлт амжилттай, ${results.failed} амжилтгүй`
        );
      }

      // Clear selection and refresh
      setSelectedIds([]);
      fetchPickupRequests();
    } catch (error) {
      toast.error('Хүсэлтүүдийг баталгаажуулахад алдаа гарлаа');
    } finally {
      setBulkApproving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
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

      {/* Filters */}
      <RequestFilters
        onFilterChange={handleFilterChange}
        activeFilters={filters}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onApproveAll={handleBulkApprove}
        onClearSelection={handleClearSelection}
        loading={bulkApproving}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === requests.length && requests.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={bulkApproving}
                  />
                </th>
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
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Хүлээгдэж буй хүсэлт олдсонгүй
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(req.id)}
                        onChange={() => handleSelectOne(req.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        disabled={bulkApproving}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {req.student?.firstName || req.studentId || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">
                        {req.requester?.fullName || req.requesterId || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {req.requestedTime ? new Date(req.requestedTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          loading={approving === req.id}
                          disabled={approving !== null || rejecting || bulkApproving}
                        >
                          Батлах
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRejectClick(req)}
                          disabled={approving !== null || rejecting || bulkApproving}
                        >
                          Татгалзах
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Request Modal */}
      <RejectRequestModal
        isOpen={rejectModalOpen}
        onClose={handleRejectCancel}
        onConfirm={handleRejectConfirm}
        request={selectedRequest}
        loading={rejecting}
      />
    </div>
  );
};

export default PickupRequestsPage;
