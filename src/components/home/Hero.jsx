import React from 'react';

export function Hero() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Find Safe & Delicious Dining</h1>
      <p className="mt-2">
        Discover allergen-friendly restaurants and share your experiences with our community of food-conscious diners.
      </p>
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 border rounded">Find Restaurants</button>
        <button className="px-4 py-2 border rounded">Share Your Experience</button>
      </div>
    </div>
  );
} 