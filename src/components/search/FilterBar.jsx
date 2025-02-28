import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function FilterBar({ 
  distance, 
  onDistanceChange,
  sortBy,
  onSortChange 
}) {
  const distances = [
    { value: 8047, label: '5 miles' },   // 5 miles in meters
    { value: 16093, label: '10 miles' }, // 10 miles in meters
    { value: 40234, label: '25 miles' }, // 25 miles in meters
    { value: 80467, label: '50 miles' }  // 50 miles in meters
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Rating' },
    { value: 'distance', label: 'Distance' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance
          </label>
          <select
            value={distance}
            onChange={(e) => onDistanceChange(Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {distances.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 