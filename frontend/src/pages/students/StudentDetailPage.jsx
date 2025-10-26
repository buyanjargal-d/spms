import { useParams } from 'react-router-dom';
import Card from '../../components/common/Card';

const StudentDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Сурагчийн дэлгэрэнгүй
      </h1>
      <Card>
        <p>Student ID: {id}</p>
        <p className="text-gray-600 mt-4">
          Энэ хэсгийг хөгжүүлэх шаардлагатай
        </p>
      </Card>
    </div>
  );
};

export default StudentDetailPage;
