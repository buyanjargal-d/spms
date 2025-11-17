import { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import reportService from '../../services/reportService';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';
import { Calendar, User, Search } from 'lucide-react';

const StudentHistoryReport = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Date range - default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await studentService.getAllStudents();
      const studentsData = response.data || response.students || response;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Сурагчдын жагсаалт татахад алдаа гарлаа');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchReport = async () => {
    if (!selectedStudent) {
      toast.error('Сурагч сонгоно уу');
      return;
    }

    try {
      setLoading(true);
      const response = await reportService.getStudentHistory(
        selectedStudent,
        startDate,
        endDate
      );
      setReport(response.data || response);
    } catch (error) {
      console.error('Error fetching student history:', error);
      toast.error('Сурагчийн түүх татахад алдаа гарлаа');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.studentCode?.toLowerCase().includes(searchLower) ||
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower)
    );
  });

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Сурагч сонгох</h3>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Сурагч хайх (код, нэр)..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Student Selector */}
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="input-field"
            disabled={loadingStudents}
          >
            <option value="">Сурагч сонгоно уу...</option>
            {filteredStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentCode} - {student.lastName} {student.firstName}
                {student.class ? ` (${student.class.gradeLevel}-${student.class.section})` : ''}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Эхлэх огноо
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дуусах огноо
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={fetchReport}
                disabled={!selectedStudent || loading}
                className="w-full"
              >
                {loading ? 'Уншиж байна...' : 'Түүх үзэх'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Selected Student Info */}
      {selectedStudentData && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedStudentData.lastName} {selectedStudentData.firstName}
              </h3>
              <p className="text-sm text-gray-600">
                Код: {selectedStudentData.studentCode} |
                Анги: {selectedStudentData.class
                  ? `${selectedStudentData.class.gradeLevel}-${selectedStudentData.class.section}`
                  : '-'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Report Results */}
      {loading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        </Card>
      )}

      {!loading && report && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div>
                <p className="text-sm text-gray-600">Нийт авалт</p>
                <p className="text-2xl font-bold text-gray-900">{report.totalPickups || 0}</p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-sm text-gray-600">Амжилттай</p>
                <p className="text-2xl font-bold text-green-600">{report.completedPickups || 0}</p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-sm text-gray-600">Хүлээгдэж буй</p>
                <p className="text-2xl font-bold text-yellow-600">{report.pendingPickups || 0}</p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-sm text-gray-600">Цуцлагдсан</p>
                <p className="text-2xl font-bold text-red-600">{report.cancelledPickups || 0}</p>
              </div>
            </Card>
          </div>

          {/* Pickup History Table */}
          <Card title="Авалтын түүх">
            {report.pickups && report.pickups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Огноо
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Цаг
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Авагч
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Харьцаа
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Төрөл
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Төлөв
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pickups.map((pickup) => (
                      <tr key={pickup.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(pickup.requestedTime).toLocaleDateString('mn-MN')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(pickup.requestedTime).toLocaleTimeString('mn-MN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {pickup.pickupPerson?.fullName || pickup.requester?.fullName || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {pickup.relationship || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                          {pickup.requestType || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pickup.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : pickup.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : pickup.status === 'approved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {pickup.status === 'completed'
                              ? 'Дууссан'
                              : pickup.status === 'pending'
                              ? 'Хүлээгдэж буй'
                              : pickup.status === 'approved'
                              ? 'Баталгаажсан'
                              : 'Цуцлагдсан'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Сонгосон хугацаанд авалт олдсонгүй</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentHistoryReport;
