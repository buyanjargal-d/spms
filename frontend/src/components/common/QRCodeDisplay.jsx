import { useState, useEffect } from 'react';
import { Download, Clock, AlertCircle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { qrService } from '../../services/qrService';

const QRCodeDisplay = ({ requestId, pickupRequest }) => {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await qrService.getQRCode(requestId);

        if (response.success) {
          setQrCodeData(response.data.qrCodeData);
          setExpiresAt(response.data.expiresAt);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError('QR код татахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchQRCode();
    }
  }, [requestId]);

  const downloadQRCode = () => {
    if (!qrCodeData) return;

    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `qr-code-${requestId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeData) return;

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR код - ${requestId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            img {
              max-width: 400px;
              margin: 20px auto;
            }
            .info {
              margin: 10px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <h2>Сурагч авах QR код</h2>
          <div class="info">Хүсэлтийн дугаар: ${requestId}</div>
          ${pickupRequest?.student ? `<div class="info">Сурагч: ${pickupRequest.student.firstName} ${pickupRequest.student.lastName}</div>` : ''}
          ${expiresAt ? `<div class="info">Дуусах хугацаа: ${new Date(expiresAt).toLocaleString('mn-MN')}</div>` : ''}
          <img src="${qrCodeData}" alt="QR Code" />
          <div class="info" style="margin-top: 20px; font-size: 12px; color: #666;">
            Энэ QR кодыг сургуулийн хаалганы хамгаалагчид үзүүлнэ үү
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatExpiryTime = (dateString) => {
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

  const isExpired = () => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">QR код татаж байна...</p>
        </div>
      </Card>
    );
  }

  if (error || !qrCodeData) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'QR код олдсонгүй'}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Сурагч авах QR код</h3>

        {/* QR Code Image */}
        <div className="bg-white p-4 rounded-lg inline-block border-4 border-gray-200">
          <img
            src={qrCodeData}
            alt="QR Code"
            className="w-64 h-64 mx-auto"
          />
        </div>

        {/* Expiration Info */}
        {expiresAt && (
          <div className={`mt-4 flex items-center justify-center ${isExpired() ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {isExpired() ? 'Хүчинтэй хугацаа дууссан' : `Дуусах хугацаа: ${formatExpiryTime(expiresAt)}`}
            </span>
          </div>
        )}

        {/* Request Info */}
        {pickupRequest && (
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            {pickupRequest.student && (
              <p>Сурагч: {pickupRequest.student.firstName} {pickupRequest.student.lastName}</p>
            )}
            {pickupRequest.requestedTime && (
              <p>Авах цаг: {formatExpiryTime(pickupRequest.requestedTime)}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={downloadQRCode}
            disabled={isExpired()}
          >
            <Download className="w-4 h-4 mr-2" />
            Татаж авах
          </Button>
          <Button
            variant="outline"
            onClick={printQRCode}
            disabled={isExpired()}
          >
            Хэвлэх
          </Button>
        </div>

        {/* Instructions */}
        <p className="mt-4 text-xs text-gray-500">
          Энэ QR кодыг сургуулийн хаалганы хамгаалагчид үзүүлнэ үү
        </p>
      </div>
    </Card>
  );
};

export default QRCodeDisplay;
