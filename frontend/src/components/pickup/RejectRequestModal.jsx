import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const RejectRequestModal = ({ isOpen, onClose, onConfirm, request, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!rejectionReason.trim()) {
      setError('Татгалзах шалтгаан заавал оруулна уу');
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError('Шалтгаан хэтэрхий богино байна (дор хаяж 10 тэмдэгт)');
      return;
    }

    if (rejectionReason.length > 500) {
      setError('Шалтгаан хэтэрхий урт байна (дээд тал нь 500 тэмдэгт)');
      return;
    }

    // Clear error and submit
    setError('');
    onConfirm(rejectionReason);
  };

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Хүсэлт татгалзах
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Request Info */}
              {request && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Сурагч:</p>
                  <p className="font-medium text-gray-900">
                    {request.student?.firstName} {request.student?.lastName}
                  </p>
                  {request.requester && (
                    <>
                      <p className="text-sm text-gray-600 mt-2 mb-1">Хүсэлт гаргагч:</p>
                      <p className="text-sm text-gray-900">
                        {request.requester?.fullName}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Warning Message */}
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  Та хүсэлтийг татгалзаж байна. Татгалзсан шалтгаан эцэг эхэд илгээгдэх тул
                  тодорхой, ойлгомжтой бичнэ үү.
                </p>
              </div>

              {/* Rejection Reason Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Татгалзах шалтгаан <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setError('');
                  }}
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Жишээ: Сурагч өнөөдөр тасалсан байна..."
                  disabled={loading}
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  {error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Дор хаяж 10 тэмдэгт оруулна уу
                    </p>
                  )}
                  <p className="text-gray-400 text-sm">
                    {rejectionReason.length}/500
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Болих
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={loading}
                disabled={loading || !rejectionReason.trim()}
              >
                Татгалзах
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RejectRequestModal;
