import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QrCode, User, CheckCircle, XCircle, Camera } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { guardService } from '../../services/guardService';
import QRScanner from '../../components/guard/QRScanner';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const pickupIdFromUrl = searchParams.get('pickupId');

  const [scanMode, setScanMode] = useState(pickupIdFromUrl ? 'manual' : 'qr'); // 'qr' | 'manual'
  const [pickupDetails, setPickupDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [photoVerified, setPhotoVerified] = useState(false);

  // If pickupId in URL, fetch details automatically
  useEffect(() => {
    if (pickupIdFromUrl) {
      handleManualVerify(pickupIdFromUrl);
    }
  }, [pickupIdFromUrl]);

  const handleQRScan = async (qrData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await guardService.verifyByQRCode(qrData);

      if (response.success) {
        setPickupDetails({
          pickup: response.data.pickup,
          student: response.data.student,
          authorizedPerson: response.data.authorizedPerson,
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error verifying QR code:', err);
      setError('QR код баталгаажуулахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualInput.trim()) {
      setError('Сурагчийн ID оруулна уу');
      return;
    }
    await handleManualVerify(manualInput.trim());
  };

  const handleManualVerify = async (studentId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await guardService.verifyByStudentId(studentId);

      if (response.success) {
        setPickupDetails({
          pickup: response.data.pickup,
          student: response.data.student,
          authorizedPerson: response.data.authorizedPerson,
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error verifying student ID:', err);
      setError('Сурагчийн мэдээлэл хайхад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!pickupDetails?.pickup?.id) return;

    try {
      setLoading(true);
      const response = await guardService.completePickup(pickupDetails.pickup.id, {
        photoVerified,
        verificationNotes: completionNotes,
        verificationMethod: scanMode === 'qr' ? 'qr' : 'manual',
      });

      if (response.success) {
        alert('Авалт амжилттай биелүүллээ!');
        // Reset form
        setPickupDetails(null);
        setManualInput('');
        setCompletionNotes('');
        setPhotoVerified(false);
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error completing pickup:', err);
      setError('Авалтыг биелүүлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setPickupDetails(null);
    setError(null);
    setManualInput('');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Авалт баталгаажуулах</h1>
        <p className="mt-1 text-sm text-gray-600">
          QR код уншуулах эсвэл сурагчийн ID оруулна уу
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-4">
        <Button
          variant={scanMode === 'qr' ? 'primary' : 'outline'}
          onClick={() => setScanMode('qr')}
          className="flex-1"
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR код уншуулах
        </Button>
        <Button
          variant={scanMode === 'manual' ? 'primary' : 'outline'}
          onClick={() => setScanMode('manual')}
          className="flex-1"
        >
          <User className="w-4 h-4 mr-2" />
          Гараар оруулах
        </Button>
      </div>

      {/* QR Scanner or Manual Input */}
      {!pickupDetails && (
        <Card>
          <div className="p-6">
            {scanMode === 'qr' ? (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  QR код уншуулах
                </h3>
                <QRScanner onScan={handleQRScan} />
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Сурагчийн ID оруулах</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Сурагчийн ID"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                  />
                  <Button onClick={handleManualEntry} disabled={loading}>
                    Хайх
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Verification Details */}
      {pickupDetails && (
        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Сурагчийн мэдээлэл</h3>
              <div className="flex items-center gap-4">
                {pickupDetails.student?.profilePhotoUrl ? (
                  <img
                    src={pickupDetails.student.profilePhotoUrl}
                    alt={`${pickupDetails.student.firstName} ${pickupDetails.student.lastName}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold">
                    {pickupDetails.student?.firstName} {pickupDetails.student?.lastName}
                  </h4>
                  <p className="text-gray-600">Анги: {pickupDetails.student?.classId || 'N/A'}</p>
                  <p className="text-gray-600">ID: {pickupDetails.student?.id}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Authorized Person */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Авах эрх бүхий хүн</h3>
              <div className="flex items-center gap-4">
                {pickupDetails.authorizedPerson?.profilePhotoUrl ? (
                  <img
                    src={pickupDetails.authorizedPerson.profilePhotoUrl}
                    alt={pickupDetails.authorizedPerson.fullName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold">
                    {pickupDetails.authorizedPerson?.fullName || 'Тодорхойгүй'}
                  </h4>
                  <p className="text-gray-600">
                    Утас: {pickupDetails.authorizedPerson?.phoneNumber || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    Хамаарал: {pickupDetails.pickup?.guestName ? 'Зочин авагч' : 'Эцэг эх'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Request Details */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Хүсэлтийн мэдээлэл</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Хүсэлтийн дугаар</p>
                  <p className="font-medium">{pickupDetails.pickup?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Авах цаг</p>
                  <p className="font-medium">{formatDateTime(pickupDetails.pickup?.requestedTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Төлөв</p>
                  <Badge variant="success">{pickupDetails.pickup?.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Төрөл</p>
                  <Badge variant="info">{pickupDetails.pickup?.requestType}</Badge>
                </div>
              </div>

              {pickupDetails.pickup?.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Тэмдэглэл</p>
                  <p className="text-gray-900">{pickupDetails.pickup.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Verification Checklist */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Баталгаажуулалтын хуудас</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={photoVerified}
                    onChange={(e) => setPhotoVerified(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Зураг таарч байна</span>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Тэмдэглэл (заавал биш)
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Нэмэлт тэмдэглэл оруулна уу..."
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Авалт дуусгах
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={loading}
              className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Татгалзах
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
