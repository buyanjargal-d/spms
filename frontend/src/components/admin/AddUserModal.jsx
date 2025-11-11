import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AddUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    danId: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'parent',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.danId || formData.danId.length < 3) {
      newErrors.danId = 'DAN ID хамгийн багадаа 3 тэмдэгттэй байх ёстой';
    }

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Нэр хамгийн багадаа 2 тэмдэгттэй байх ёстой';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Зөв имэйл хаяг оруулна уу';
    }

    if (formData.phone && !/^\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'Утасны дугаар 8 оронтой байх ёстой';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Нууц үг таарахгүй байна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await adminService.createUser(userData);
      toast.success('Хэрэглэгч амжилттай нэмэгдлээ');
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Хэрэглэгч нэмэхэд алдаа гарлаа';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Шинэ хэрэглэгч нэмэх</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DAN ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="danId"
              value={formData.danId}
              onChange={handleChange}
              className={`input-field ${errors.danId ? 'border-red-500' : ''}`}
              placeholder="Жишээ: admin001"
            />
            {errors.danId && <p className="text-red-500 text-sm mt-1">{errors.danId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Овог нэр <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
              placeholder="Жишээ: Бат Болд"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Утас</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="99887766"
              maxLength="8"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Үүрэг <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="admin">Админ</option>
              <option value="teacher">Багш</option>
              <option value="parent">Эцэг эх</option>
              <option value="guard">Харуул</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Нууц үг <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Хамгийн багадаа 6 тэмдэгт"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Нууц үг баталгаажуулах <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Нууц үгээ дахин оруулна уу"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Болих
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
