import { useState } from 'react';
import { Filter, X, Search } from 'lucide-react';
import Button from '../common/Button';

const RequestFilters = ({ onFilterChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters || {
    status: 'all',
    date: 'all',
    pickupType: 'all',
    search: '',
  });

  const statusOptions = [
    { value: 'all', label: 'Бүгд' },
    { value: 'pending', label: 'Хүлээгдэж буй' },
    { value: 'approved', label: 'Баталгаажсан' },
    { value: 'rejected', label: 'Татгалзсан' },
    { value: 'completed', label: 'Дууссан' },
  ];

  const dateOptions = [
    { value: 'all', label: 'Бүгд' },
    { value: 'today', label: 'Өнөөдөр' },
    { value: 'this_week', label: 'Энэ долоо хоног' },
    { value: 'this_month', label: 'Энэ сар' },
  ];

  const pickupTypeOptions = [
    { value: 'all', label: 'Бүгд' },
    { value: 'standard', label: 'Энгийн' },
    { value: 'advance', label: 'Урьдчилсан' },
    { value: 'guest', label: 'Зочин' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: 'all',
      date: 'all',
      pickupType: 'all',
      search: '',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    localFilters.status !== 'all' ||
    localFilters.date !== 'all' ||
    localFilters.pickupType !== 'all' ||
    localFilters.search !== '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Шүүлтүүр</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              Идэвхтэй
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Хураах' : 'Дэлгэрэнгүй'}
        </button>
      </div>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              handleFilterChange('status', option.value);
              onFilterChange({ ...localFilters, status: option.value });
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              localFilters.status === option.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сурагч хайх
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Овог нэрээр хайх..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Огноо
            </label>
            <select
              value={localFilters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хүсэлтийн төрөл
            </label>
            <select
              value={localFilters.pickupType}
              onChange={(e) => handleFilterChange('pickupType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pickupTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleClearFilters}
              icon={X}
            >
              Цэвэрлэх
            </Button>
            <Button size="sm" onClick={handleApplyFilters} icon={Filter}>
              Шүүх
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestFilters;
