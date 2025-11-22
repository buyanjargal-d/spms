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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500 text-white shadow-lg mb-4">
            <GraduationCap className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-primary-900 mb-2">SPMS</h1>
          <p className="text-primary-800 text-lg">
            Сурагч авах удирдлагын систем
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-primary-200">
          <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
            <LogIn className="w-6 h-6" />
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
              <label className="block text-sm font-medium text-secondary mb-3">
                Үүрэг <span className="text-danger-500">*</span>
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
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-primary-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-secondary">
                Намайг санах (30 хоног)
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-lg py-3"
              loading={loading}
            >
              {!loading && <LogIn className="w-5 h-5 mr-2" />}
              Нэвтрэх
            </Button>
          </form>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-primary-50 rounded-lg border-2 border-primary-300">
              <p className="text-sm font-medium text-primary-900 mb-2">
                Туршилтын нэвтрэх мэдээлэл:
              </p>
              <div className="text-xs text-primary-800 space-y-1">
                <p>• Админ: admin001</p>
                <p>• Багш: teacher001</p>
                <p>• Эцэг эх: parent001</p>
                <p>• Хамгаалагч: guard001</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-primary-900 mt-6 font-medium">
          Бакалаврын судалгааны ажил - Д.Буянжаргал
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
