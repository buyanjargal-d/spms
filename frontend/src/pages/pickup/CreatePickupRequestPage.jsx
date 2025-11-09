import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Users } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { parentService } from '../../services/parentService';
import { pickupService } from '../../services/pickupService';
import { useAuth } from '../../contexts/AuthContext';

const CreatePickupRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    pickupPersonId: '',
    pickupType: 'parent',
    requestType: 'standard', // standard or advance
    requestedTime: '',
    scheduledPickupTime: '',
    notes: '',
    specialInstructions: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch parent's children on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await parentService.getMyChildren();
        const childrenData = response.data || [];
        setChildren(childrenData);

        // Auto-select first child if available
        if (childrenData.length > 0) {
          setFormData(prev => ({ ...prev, studentId: childrenData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };

    fetchChildren();
  }, []);

  // Fetch authorized guardians when student is selected
  useEffect(() => {
    const fetchGuardians = async () => {
      if (!formData.studentId) {
        setGuardians([]);
        return;
      }

      try {
        const response = await parentService.getAuthorizedGuardians(formData.studentId);
        const guardiansData = response.data || [];
        setGuardians(guardiansData);
      } catch (error) {
        console.error('Error fetching guardians:', error);
        setGuardians([]);
      }
    };

    fetchGuardians();
  }, [formData.studentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePickupTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      pickupType: type,
      pickupPersonId: type === 'parent' ? user.id : ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = 'Сурагч сонгоно уу';
    }

    if (!formData.requestedTime) {
      newErrors.requestedTime = 'Цаг сонгоно уу';
    } else {
      const requestedDate = new Date(formData.requestedTime);
      const now = new Date();
      if (requestedDate < now) {
        newErrors.requestedTime = 'Ирээдүйн цаг сонгоно уу';
      }
    }

    // Validate scheduled pickup time for advance requests
    if (formData.requestType === 'advance') {
      if (!formData.scheduledPickupTime) {
        newErrors.scheduledPickupTime = 'Урьдчилсан хүсэлтэд товлосон цаг оруулна уу';
      } else {
        const scheduledDate = new Date(formData.scheduledPickupTime);
        const requestedDate = new Date(formData.requestedTime);

        if (scheduledDate <= requestedDate) {
          newErrors.scheduledPickupTime = 'Товлосон цаг нь хүсэлт үүсгэсэн цагаас хойш байх ёстой';
        }

        // Check if scheduled time is at least 1 hour in the future
        const oneHourFromNow = new Date();
        oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
        if (scheduledDate < oneHourFromNow) {
          newErrors.scheduledPickupTime = 'Товлосон цаг нь одооноос хойш дор хаяж 1 цагийн дараа байх ёстой';
        }
      }
    }

    if (formData.pickupType === 'guest' && !formData.pickupPersonId) {
      newErrors.pickupPersonId = 'Зочин авагч сонгоно уу';
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
      const requestData = {
        studentId: formData.studentId,
        requestedTime: formData.requestedTime,
        pickupType: formData.pickupType,
        requestType: formData.requestType,
        notes: formData.notes || '',
        specialInstructions: formData.specialInstructions || '',
      };

      // Add scheduled pickup time for advance requests
      if (formData.requestType === 'advance' && formData.scheduledPickupTime) {
        requestData.scheduledPickupTime = formData.scheduledPickupTime;
      }

      // Add pickupPersonId if it's a guest pickup
      if (formData.pickupType === 'guest' && formData.pickupPersonId) {
        requestData.pickupPersonId = formData.pickupPersonId;
      }

      await pickupService.createRequest(requestData);

      // Navigate to requests page on success
      navigate('/pickup/requests');
    } catch (error) {
      console.error('Error creating pickup request:', error);
      setErrors({
        submit: error.response?.data?.message || 'Хүсэлт үүсгэхэд алдаа гарлаа'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          icon={ArrowLeft}
        >
          Буцах
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хүүхэд авах хүсэлт үүсгэх</h1>
          <p className="text-gray-600 mt-1">
            Хүүхдээ авах хүсэлт бүртгэнэ үү
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Сурагч сонгох
            </label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.studentId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={children.length === 0}
            >
              <option value="">Сурагч сонгоно уу</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} - {child.class?.name || 'N/A'}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
            )}
            {children.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                Таны бүртгэлтэй хүүхэд олдсонгүй
              </p>
            )}
          </div>

          {/* Request Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хүсэлтийн төрөл
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, requestType: 'standard' }))}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.requestType === 'standard'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Clock className="w-6 h-6 mb-2 text-blue-600" />
                <p className="font-medium text-gray-900">Энгийн хүсэлт</p>
                <p className="text-sm text-gray-500">Одоо эсвэл ойрын хугацаанд</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, requestType: 'advance' }))}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.requestType === 'advance'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-6 h-6 mb-2 text-purple-600" />
                <p className="font-medium text-gray-900">Урьдчилсан хүсэлт</p>
                <p className="text-sm text-gray-500">Ирээдүйн тодорхой цагт</p>
              </button>
            </div>
          </div>

          {/* Pickup Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Авах хүний төрөл
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handlePickupTypeChange('parent')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.pickupType === 'parent'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className="w-6 h-6 mb-2 text-blue-600" />
                <p className="font-medium text-gray-900">Би өөрөө</p>
                <p className="text-sm text-gray-500">Эцэг эх өөрөө авна</p>
              </button>

              <button
                type="button"
                onClick={() => handlePickupTypeChange('guest')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.pickupType === 'guest'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mb-2 text-green-600" />
                <p className="font-medium text-gray-900">Зочин авагч</p>
                <p className="text-sm text-gray-500">Төрөл садан эсвэл найз</p>
              </button>
            </div>
          </div>

          {/* Guest Pickup Person Selector */}
          {formData.pickupType === 'guest' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Зочин авагч сонгох
              </label>
              <select
                name="pickupPersonId"
                value={formData.pickupPersonId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pickupPersonId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={guardians.length === 0}
              >
                <option value="">Зочин авагч сонгоно уу</option>
                {guardians.map((guardian) => (
                  <option key={guardian.id} value={guardian.id}>
                    {guardian.fullName} ({guardian.phoneNumber})
                  </option>
                ))}
              </select>
              {errors.pickupPersonId && (
                <p className="text-red-500 text-sm mt-1">{errors.pickupPersonId}</p>
              )}
              {guardians.length === 0 && formData.studentId && (
                <p className="text-yellow-600 text-sm mt-1">
                  Энэ сурагчид зөвшөөрөгдсөн авагч олдсонгүй
                </p>
              )}
            </div>
          )}

          {/* Requested Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              {formData.requestType === 'advance' ? 'Хүсэлт үүсгэх цаг' : 'Авах цаг'}
            </label>
            <input
              type="datetime-local"
              name="requestedTime"
              value={formData.requestedTime}
              onChange={handleInputChange}
              min={getMinDateTime()}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.requestedTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.requestedTime && (
              <p className="text-red-500 text-sm mt-1">{errors.requestedTime}</p>
            )}
          </div>

          {/* Scheduled Pickup Time (for advance requests) */}
          {formData.requestType === 'advance' && (
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Товлосон авах цаг (урьдчилсан)
              </label>
              <input
                type="datetime-local"
                name="scheduledPickupTime"
                value={formData.scheduledPickupTime}
                onChange={handleInputChange}
                min={getMinDateTime()}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.scheduledPickupTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.scheduledPickupTime && (
                <p className="text-red-500 text-sm mt-1">{errors.scheduledPickupTime}</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                💡 Урьдчилсан хүсэлт нь ирээдүйн тодорхой цагт хүүхдээ авахаар төлөвлөж байгаа тохиолдолд ашиглана. Товлосон цаг нь одооноос хойш дор хаяж 1 цагийн дараа байх ёстой.
              </p>
            </div>
          )}

          {/* Special Instructions (for advance requests) */}
          {formData.requestType === 'advance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тусгай заавар (заавал биш)
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows="2"
                placeholder="Жишээ: Сургуулийн урд талын хаалганаас авна..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тэмдэглэл (заавал биш)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Нэмэлт мэдээлэл..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Болих
            </Button>
            <Button
              type="submit"
              disabled={loading || children.length === 0}
              loading={loading}
            >
              Хүсэлт үүсгэх
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePickupRequestPage;
