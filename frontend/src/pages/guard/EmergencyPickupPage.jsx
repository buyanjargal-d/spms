import { useState } from 'react';
import { AlertTriangle, User, Phone, FileText } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { guardService } from '../../services/guardService';

const EmergencyPickupPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    studentId: '',
    pickupPersonName: '',
    pickupPersonPhone: '',
    relationship: '',
    reason: '',
    guardNotes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.studentId || !formData.pickupPersonName || !formData.pickupPersonPhone ||
        !formData.relationship || !formData.reason) {
      setError('Бүх шаардлагатай мэдээллийг оруулна уу');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await guardService.createEmergencyPickup(formData);

      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          studentId: '',
          pickupPersonName: '',
          pickupPersonPhone: '',
          relationship: '',
          reason: '',
          guardNotes: '',
        });

        // Show success message
        alert(`Яаралтай авалт амжилттай бүртгэгдлээ!\nХүсэлтийн дугаар: ${response.data.pickupId}\n\nАдмин хянах шаардлагатай.`);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error creating emergency pickup:', err);
      setError('Яаралтай авалт үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Warning */}
      <Card className="border-red-200 bg-red-50">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-red-900">Яаралтай авалт</h1>
              <p className="mt-2 text-red-700">
                Энэ нь зөвхөн яаралтай тохиолдолд ашиглагдах функц юм. Бүх яаралтай авалт нь
                админд мэдэгдэж, хянагдах болно.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Emergency Types Info */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-3">Яаралтай тохиолдлууд:</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>Эрүүл мэндийн яаралтай тусламж</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>Гэр бүлийн яаралтай асуудал</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>Байгалийн гамшиг / Нүүлгэн шилжүүлэлт</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>Бусад яаралтай шалтгаан</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Emergency Pickup Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold">Яаралтай авалтын мэдээлэл</h2>

            {/* Student Information */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Сурагчийн ID <span className="text-red-600">*</span>
              </label>
              <Input
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Сурагчийн ID оруулна уу"
                required
              />
            </div>

            {/* Pickup Person Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Авч явах хүний нэр <span className="text-red-600">*</span>
                </label>
                <Input
                  name="pickupPersonName"
                  value={formData.pickupPersonName}
                  onChange={handleChange}
                  placeholder="Бүтэн нэр"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Утасны дугаар <span className="text-red-600">*</span>
                </label>
                <Input
                  name="pickupPersonPhone"
                  value={formData.pickupPersonPhone}
                  onChange={handleChange}
                  placeholder="99999999"
                  required
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Сурагчтай харилцаа <span className="text-red-600">*</span>
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Сонгоно уу</option>
                <option value="parent">Эцэг эх</option>
                <option value="guardian">Асран хамгаалагч</option>
                <option value="relative">Төрөл садан</option>
                <option value="emergency_contact">Яаралтай холбоо барих хүн</option>
                <option value="other">Бусад</option>
              </select>
            </div>

            {/* Emergency Reason */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Яаралтай авах шалтгаан <span className="text-red-600">*</span>
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Сонгоно уу</option>
                <option value="medical_emergency">Эрүүл мэндийн яаралтай тусламж</option>
                <option value="family_emergency">Гэр бүлийн яаралтай асуудал</option>
                <option value="natural_disaster">Байгалийн гамшиг / Нүүлгэн шилжүүлэлт</option>
                <option value="other">Бусад (дэлгэрэнгүй тайлбар оруулна уу)</option>
              </select>
            </div>

            {/* Guard Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Дэлгэрэнгүй тайлбар <span className="text-red-600">*</span>
              </label>
              <textarea
                name="guardNotes"
                value={formData.guardNotes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Яаралтай авах шалтгааныг дэлгэрэнгүй тайлбарлана уу..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Энэ мэдээлэл нь админд илгээгдэж, хянагдах болно
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                {loading ? 'Бүртгэж байна...' : 'Яаралтай авалт бүртгэх'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  studentId: '',
                  pickupPersonName: '',
                  pickupPersonPhone: '',
                  relationship: '',
                  reason: '',
                  guardNotes: '',
                })}
                disabled={loading}
              >
                Цэвэрлэх
              </Button>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                <strong>Анхааруулга:</strong> Яаралтай авалт үүсгэсний дараа админд шууд мэдэгдэх бөгөөд
                дараа нь хянагдах болно. Зөвхөн жинхэнэ яаралтай тохиолдолд ашиглана уу.
              </p>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EmergencyPickupPage;
