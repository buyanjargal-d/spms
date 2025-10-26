import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const PickupRequestsPage = () => {
  const requests = [
    { id: 1, student: 'Төмөр Баярын', guardian: 'Баяр эцэг', time: '14:30', status: 'pending' },
    { id: 2, student: 'Сайхан Болдын', guardian: 'Болд эх', time: '15:00', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Авах хүсэлтүүд</h1>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Сурагч</th>
              <th className="text-left py-3 px-4">Авагч</th>
              <th className="text-left py-3 px-4">Цаг</th>
              <th className="text-left py-3 px-4">Төлөв</th>
              <th className="text-left py-3 px-4">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="py-3 px-4">{req.student}</td>
                <td className="py-3 px-4">{req.guardian}</td>
                <td className="py-3 px-4">{req.time}</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Хүлээгдэж буй</Badge>
                </td>
                <td className="py-3 px-4">
                  <Button size="sm">Батлах</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default PickupRequestsPage;
