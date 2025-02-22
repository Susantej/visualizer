
import React from 'react';
import BiblePlanComponent from '../components/BiblePlanComponent';

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2">Bible Visualizer</h1>
      <p className="text-center text-gray-600 mb-8">Explore scripture with AI-powered insights</p>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">One Year Chronological Bible</h2>
        <p className="text-center text-gray-600 mb-8">Start your journey through the Bible in chronological order</p>
        <BiblePlanComponent />
      </div>
    </div>
  );
};

export default Index;
