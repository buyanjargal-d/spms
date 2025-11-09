import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import RoleCard from '../../components/auth/RoleCard';
import toast from 'react-hot-toast';
import { LogIn, Shield, GraduationCap, Users, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    danId: '',
    role: 'teacher',
    rememberMe: false,
  });

  const roles = [
    {
      value: 'admin',
      icon: Shield,
      title: 'Админ',
      description: 'Системийн удирдлага',
    },
    {
      value: 'teacher',
      icon: GraduationCap,
      title: 'Багш',
      description: 'Хүүхэд авах зөвшөөрөл',
    },
    {
      value: 'parent',
      icon: Users,
      title: 'Эцэг эх',
      description: 'Хүүхэд авах хүсэлт',
    },
    {
      value: 'guard',
      icon: ShieldCheck,
      title: 'Хамгаалагч',
      description: 'Хүүхэд авах баталгаажуулалт',
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8">
      <div className="w-full max-w-2xl">
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
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Нэвтрэх
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Үүрэг <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <RoleCard
                    key={role.value}
                    role={role.value}
                    icon={role.icon}
                    title={role.title}
                    description={role.description}
                    selected={formData.role === role.value}
                    onClick={handleRoleSelect}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Намайг санах (30 хоног)
              </label>
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

          {/* Demo credentials - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
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
          )}
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
