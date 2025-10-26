import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    danId: '',
    role: 'teacher',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success('Амжилттай нэвтэрлээ!');
        navigate('/');
      } else {
        toast.error(result.error || 'Нэвтрэх үед алдаа гарлаа');
      }
    } catch (error) {
      toast.error('Нэвтрэх үед алдаа гарлаа');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-4">
            S
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SPMS</h1>
          <p className="text-gray-600 mt-2">
            Сурагч авах удирдлагын систем
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Нэвтрэх
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="DAN ID"
              name="danId"
              type="text"
              value={formData.danId}
              onChange={handleChange}
              placeholder="admin001, teacher001, parent001"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Үүрэг <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="admin">Админ</option>
                <option value="teacher">Багш</option>
                <option value="parent">Эцэг эх</option>
                <option value="guard">Хамгаалагч</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Нэвтрэх
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Туршилтын нэвтрэх мэдээлэл:
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Админ: admin001</p>
              <p>• Багш: teacher001</p>
              <p>• Эцэг эх: parent001</p>
              <p>• Хамгаалагч: guard001</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Бакалаврын судалгааны ажил - Д.Буянжаргал
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
