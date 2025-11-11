import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Search, Edit, Trash2, Lock, Unlock, Key, UserCheck, UserX } from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import AddUserModal from '../../components/admin/AddUserModal';
import EditUserModal from '../../components/admin/EditUserModal';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (statusFilter !== 'all') filters.isActive = statusFilter === 'active';
      if (searchTerm) filters.search = searchTerm;

      const response = await adminService.getAllUsers(filters);
      const usersData = response.data || response.users || response;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Хэрэглэгчдийн мэдээлэл татахад алдаа гарлаа');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      toast.success(`Хэрэглэгч ${!currentStatus ? 'идэвхжүүлсэн' : 'идэвхгүй болгосон'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Хэрэглэгчийн төлөв өөрчлөхөд алдаа гарлаа');
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      await adminService.unlockUserAccount(userId);
      toast.success('Хэрэглэгчийн бүртгэл түгжээ тайлагдсан');
      fetchUsers();
    } catch (error) {
      console.error('Error unlocking account:', error);
      toast.error('Түгжээ тайлахад алдаа гарлаа');
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Шинэ нууц үг оруулна уу (хамгийн багадаа 6 тэмдэгт):');
    if (!newPassword) return;

    if (newPassword.length < 6) {
      toast.error('Нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой');
      return;
    }

    try {
      await adminService.resetUserPassword(userId, newPassword);
      toast.success('Нууц үг шинэчлэгдсэн');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Нууц үг шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Та ${userName} хэрэглэгчийг устгахдаа итгэлтэй байна уу?`)) return;

    try {
      await adminService.deleteUser(userId);
      toast.success('Хэрэглэгч устгагдсан');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Хэрэглэгч устгахад алдаа гарлаа');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      teacher: 'bg-blue-100 text-blue-800',
      parent: 'bg-green-100 text-green-800',
      guard: 'bg-orange-100 text-orange-800',
    };
    const labels = {
      admin: 'Админ',
      teacher: 'Багш',
      parent: 'Эцэг эх',
      guard: 'Харуул',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="flex items-center text-green-600 text-sm">
        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
        Идэвхитэй
      </span>
    ) : (
      <span className="flex items-center text-gray-400 text-sm">
        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
        Идэвхгүй
      </span>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хэрэглэгчийн удирдлага</h1>
          <p className="text-gray-600 mt-1">Системийн хэрэглэгчдийг удирдах</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Хэрэглэгч нэмэх
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Нэр, DAN ID, имэйл хайх..."
                  className="input-field pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                className="input-field w-full"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Бүх үүрэг</option>
                <option value="admin">Админ</option>
                <option value="teacher">Багш</option>
                <option value="parent">Эцэг эх</option>
                <option value="guard">Харуул</option>
              </select>
            </div>

            <div>
              <select
                className="input-field w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Бүх төлөв</option>
                <option value="active">Идэвхитэй</option>
                <option value="inactive">Идэвхгүй</option>
              </select>
            </div>
          </div>
        </form>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Хэрэглэгч олдсонгүй</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">DAN ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Нэр</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Утас</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Имэйл</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Үүрэг</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Төлөв</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{user.danId}</td>
                    <td className="py-3 px-4 text-sm">{user.fullName}</td>
                    <td className="py-3 px-4 text-sm">{user.phone || '-'}</td>
                    <td className="py-3 px-4 text-sm">{user.email || '-'}</td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">{getStatusBadge(user.isActive)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Засах"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          className={`p-1 rounded ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.isActive ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        {user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date() && (
                          <button
                            onClick={() => handleUnlockAccount(user.id)}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                            title="Түгжээ тайлах"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                          title="Нууц үг шинэчлэх"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Устгах"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
