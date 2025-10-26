import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Search } from 'lucide-react';

const StudentsPage = () => {
  // Mock data
  const students = [
    { id: 1, code: 'STU2024001', name: 'Төмөр Баярын', grade: 5, class: '5-A' },
    { id: 2, code: 'STU2024002', name: 'Сайхан Болдын', grade: 3, class: '3-B' },
    { id: 3, code: 'STU2024003', name: 'Болор Дорж', grade: 5, class: '5-A' },
  ];

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
            />
          </div>
        </div>

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
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {student.code}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {student.class}
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
      </Card>
    </div>
  );
};

export default StudentsPage;
