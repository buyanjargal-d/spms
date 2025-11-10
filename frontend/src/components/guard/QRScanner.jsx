import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, AlertCircle } from 'lucide-react';

const QRScanner = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScanner = useRef(null);

  useEffect(() => {
    // Initialize scanner
    if (scannerRef.current && !html5QrcodeScanner.current) {
      html5QrcodeScanner.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1.0,
        },
        false
      );

      html5QrcodeScanner.current.render(
        (decodedText) => {
          // QR code successfully scanned
          setScanning(false);
          setError(null);
          onScan(decodedText);

          // Stop scanning after successful scan
          if (html5QrcodeScanner.current) {
            html5QrcodeScanner.current.clear();
          }
        },
        (errorMessage) => {
          // QR code scanning error (ignore most errors as they're continuous)
          // Only show critical errors
          if (errorMessage.includes('NotAllowedError')) {
            setError('Камер ашиглах эрх олгоно уу');
          }
        }
      );

      setScanning(true);
    }

    // Cleanup on unmount
    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.clear().catch(err => {
          console.error('Failed to clear QR scanner:', err);
        });
      }
    };
  }, [onScan]);

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative">
        <div id="qr-reader" ref={scannerRef} className="w-full"></div>

        {scanning && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Уншиж байна...
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Алдаа гарлаа</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Заавар:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• QR кодыг камерын өмнө байрлуулна уу</li>
          <li>• QR код бүрэн харагдаж байгаа эсэхийг шалгана уу</li>
          <li>• Гэрэл хангалттай байгаа эсэхийг шалгана уу</li>
          <li>• Автоматаар уншигдах болно</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;
