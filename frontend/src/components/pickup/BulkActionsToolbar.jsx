import { CheckCircle, X } from 'lucide-react';
import Button from '../common/Button';

const BulkActionsToolbar = ({ selectedCount, onApproveAll, onClearSelection, loading }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-semibold">
            {selectedCount}
          </div>
          <p className="text-blue-900 font-medium">
            {selectedCount} хүсэлт сонгогдсон
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={onClearSelection}
            disabled={loading}
            icon={X}
          >
            Цуцлах
          </Button>
          <Button
            size="sm"
            onClick={onApproveAll}
            loading={loading}
            disabled={loading}
            icon={CheckCircle}
          >
            Сонгосныг батлах ({selectedCount})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
