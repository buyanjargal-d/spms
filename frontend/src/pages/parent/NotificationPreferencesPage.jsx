import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { notificationPreferencesService } from '../../services/notificationService';

const NotificationPreferencesPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    smsEnabled: true,
    pushEnabled: true,
    emailEnabled: false,
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await notificationPreferencesService.getPreferences();
        if (response.success) {
          setPreferences(response.data);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await notificationPreferencesService.updatePreferences(preferences);

      if (response.success) {
        setSuccessMessage('Тохиргоо амжилттай хадгалагдлаа');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мэдэгдлийн тохиргоо</h1>
        <p className="text-gray-600 mt-1">
          Та хүлээн авах мэдэгдлийн төрлүүдийг тохируулна уу
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">✓ {successMessage}</p>
        </div>
      )}

      {/* Notification Channels */}
      <Card title="Мэдэгдлийн сувгууд">
        <div className="space-y-6">
          {/* SMS Notifications */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">SMS мэдэгдэл</h3>
                  <Badge variant="info">Статик</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Утасны дугаар руу мэдэгдэл илгээх (статик хэрэгжилт)
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Хүсэлт үүсгэсэн үед</li>
                  <li>• Хүсэлт баталгаажсан үед</li>
                  <li>• Хүүхдээ авсан үед</li>
                </ul>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smsEnabled}
                onChange={() => handleToggle('smsEnabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Push Notifications */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">Push мэдэгдэл</h3>
                  <Badge variant="success">Статик</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Аппликейшн дотор мэдэгдэл үзүүлэх (FCM статик хэрэгжилт)
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Бүх төрлийн хүсэлтийн мэдээлэл</li>
                  <li>• Системийн мэдэгдэл</li>
                  <li>• Шинэчлэлтийн мэдэгдэл</li>
                </ul>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushEnabled}
                onChange={() => handleToggle('pushEnabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Email Notifications */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg opacity-60">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Mail className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">Имэйл мэдэгдэл</h3>
                  <Badge variant="secondary">Идэвхгүй</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Имэйл хаяг руу мэдэгдэл илгээх (одоогоор дэмжигдээгүй)
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Өдрийн тайлан</li>
                  <li>• Долоо хоногийн тойм</li>
                </ul>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed">
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                disabled
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Information Card */}
      <Card>
        <div className="flex items-start space-x-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Мэдэгдлийн тухай</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                • <strong>SMS мэдэгдэл:</strong> Таны бүртгэлтэй утасны дугаар руу текст мессеж илгээгдэнэ. Энэ нь статик хэрэгжилт тул бодит SMS илгээгдэхгүй, харин системд лог бичигдэнэ.
              </li>
              <li>
                • <strong>Push мэдэгдэл:</strong> Аппликейшн дотор шууд мэдэгдэл үзүүлэх боломжтой. Firebase Cloud Messaging (FCM) ашигласан статик хэрэгжилт.
              </li>
              <li>
                • <strong>Статик хэрэгжилт:</strong> Одоогийн хувилбарт гадны үйлчилгээнүүд (Twilio, Firebase) холбогдоогүй тул демо/статик горимд ажиллана.
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={saving}
          icon={Save}
        >
          Хадгалах
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
