import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { teacherService } from '../../services/teacherService';
import toast from 'react-hot-toast';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

const MyClassPage = () => {
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      setLoading(true);

      // Fetch class info
      const classResponse = await teacherService.getMyClass();
      const classData = classResponse.data || classResponse;
      setClassInfo(classData);

      // Fetch students
      const studentsResponse = await teacherService.getMyStudents();
      const studentsData = studentsResponse.data || studentsResponse.students || studentsResponse;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching class data:', error);
      if (error.response?.status === 404) {
        toast.error('Танд анги оноогдоогүй байна');
      } else {
        toast.error('Ангийн мэдээлэл татахад алдаа гарлаа');
      }
    } finally {
      setLoading(false);
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

  if (!classInfo) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Миний анги</h1>
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Танд анги оноогдоогүй байна</p>
            <p className="text-gray-500 text-sm">Администратортай холбогдоно уу</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Миний анги</h1>
        <p className="text-gray-600 mt-1">Ангийн мэдээлэл ба сурагчид</p>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Анги</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {classInfo.gradeLevel}-{classInfo.section}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Нийт сурагч</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {students.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Түвшин</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {classInfo.gradeLevel}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Students List */}
      <Card title="Сурагчдын жагсаалт">
        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Энэ ангид сурагч бүртгэгдээгүй байна</p>
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
                    Төлөв
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Асран хамгаалагч
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {student.studentCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {student.lastName} {student.firstName}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {student.guardians && student.guardians.length > 0
                        ? student.guardians.map(sg => sg.guardian?.fullName || sg.guardian?.lastName).filter(Boolean).join(', ')
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/students/${student.id}`)}
                      >
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

export default MyClassPage;
