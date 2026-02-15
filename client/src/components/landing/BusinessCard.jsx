import React from 'react';

const BusinessCard = () => {
  return (
    <section className="max-w-4xl mx-auto my-12 p-6 bg-white/80 dark:bg-gray-800/70 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">La Cascada Sports Bar and Gardens</h2>
          <p className="text-sm text-gray-600">Hotel resort · Bar & Grill · Hotel Bar</p>
          <p className="mt-3 text-gray-700">ALONG LIMURU ROAD, RUAKA TOWN, Ruaka, Nairobi Area, Kenya</p>
          <p className="mt-1 text-gray-600">GPS: -1.20695, 36.78676</p>
        </div>

        <div className="text-left md:text-right">
          <p className="font-medium">Phone: <a href="tel:+254700555888" className="text-indigo-600">0700555888</a> / <a href="tel:+254705588015" className="text-indigo-600">0705588015</a></p>
          <p className="mt-2"><a href="https://lacascada.co.ke" target="_blank" rel="noopener noreferrer" className="text-indigo-600">lacascada.co.ke</a></p>
          <p className="mt-2"><a href="https://facebook.com/852153504802611" target="_blank" rel="noopener noreferrer" className="text-indigo-600">Facebook</a></p>
        </div>
      </div>
    </section>
  );
};

export default BusinessCard;
