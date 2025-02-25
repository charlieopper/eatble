import React from 'react';
import { Search } from 'lucide-react';

export function SearchForm() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Enter location"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Restaurant name (optional)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Distance</option>
          <option>5 miles</option>
          <option>10 miles</option>
          <option>25 miles</option>
        </select>
      </div>
    </div>
  );
} 