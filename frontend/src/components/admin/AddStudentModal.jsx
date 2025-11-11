import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AddStudentModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentCode: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gradeLevel: 1,
    classId: '',
    medicalConditions: '',
    allergies: '',
    medications: '',
    emergencyNotes: '',
    pickupInstructions: '',
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await adminService.getAllClasses({ isActive: true });
      const classesData = response.data || response.classes || response;
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Ангийн мэдээлэл татахад алдаа гарлаа');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentCode || formData.studentCode.length < 3) {
      newErrors.studentCode = 'Сурагчийн код хамгийн багадаа 3 тэмдэгттэй байх ёстой';
    }

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = 'Нэр хамгийн багадаа 2 тэмдэгттэй байх ёстой';
    }

    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = 'Овог хамгийн багадаа 2 тэмдэгттэй байх ёстой';
    }

    if (!formData.gradeLevel || formData.gradeLevel < 1 || formData.gradeLevel > 12) {
      newErrors.gradeLevel = 'Анги 1-12 хооронд байх ёстой';
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
      const studentData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gradeLevel: parseInt(formData.gradeLevel),
        classId: formData.classId || undefined,
      };

      await adminService.createStudent(studentData);
      toast.success('Сурагч амжилттай нэмэгдлээ');
      onSuccess();
    } catch (error) {
      console.error('Error creating student:', error);
      const errorMessage = error.response?.data?.message || 'Сурагч нэмэхэд алдаа гарлаа';
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Шинэ сурагч нэмэх</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Үндсэн мэдээлэл</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сурагчийн код <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentCode"
                  value={formData.studentCode}
                  onChange={handleChange}
                  className={`input-field ${errors.studentCode ? 'border-red-500' : ''}`}
                  placeholder="Жишээ: STU001"
                />
                {errors.studentCode && <p className="text-red-500 text-sm mt-1">{errors.studentCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Овог <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Жишээ: Бат"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Нэр <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Жишээ: Болд"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Төрсөн огноо</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Анги <span className="text-red-500">*</span>
                </label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className={`input-field ${errors.gradeLevel ? 'border-red-500' : ''}`}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}-р анги
                    </option>
                  ))}
                </select>
                {errors.gradeLevel && <p className="text-red-500 text-sm mt-1">{errors.gradeLevel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Анги сонгох</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Анги сонгоно уу</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.gradeLevel}-р анги)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Эрүүл мэндийн мэдээлэл</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Өвчин, эмгэг
                </label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Хэрэв байвал тэмдэглэнэ үү"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Харшил
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Хэрэв байвал тэмдэглэнэ үү"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тогтмол уух эм
                </label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Хэрэв байвал тэмдэглэнэ үү"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Яаралтай тэмдэглэл
                </label>
                <textarea
                  name="emergencyNotes"
                  value={formData.emergencyNotes}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Яаралтай үед анхаарах зүйлс"
                />
              </div>
            </div>
          </div>

          {/* Pickup Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Авах зааварчилгаа</h3>
            <div>
              <textarea
                name="pickupInstructions"
                value={formData.pickupInstructions}
                onChange={handleChange}
                className="input-field w-full"
                rows="4"
                placeholder="Сурагчийг авах үед анхаарах зүйлс, тусгай зааварчилгаа"
              />
            </div>
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

export default AddStudentModal;
