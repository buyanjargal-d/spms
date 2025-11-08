import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Search } from 'lucide-react';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await studentService.getAllStudents();
        console.log('Students API response:', response);

        // Handle different response formats
        const studentsData = response.data || response.students || response;
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Сурагчдын мэдээлэл татахад алдаа гарлаа');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.studentCode?.toLowerCase().includes(searchLower) ||
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Сурагчид</h1>
          <p className="text-gray-600 mt-1">Бүх сурагчдын жагсаалт</p>
        </div>
        <Button variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Сурагч нэмэх
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Сурагч хайх..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {students.length === 0 ? 'Сурагч олдсонгүй' : 'Хайлтаар сурагч олдсонгүй'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Код
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Нэр
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Анги
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Төлөв
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {student.studentCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {student.lastName} {student.firstName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {student.gradeLevel}-р анги
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="secondary" size="sm">
                        Дэлгэрэнгүй
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentsPage;
