import React from 'react';

const RecommendationCard = ({ original, corrected, onClick }) => {
   

  return (
    <div
      className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <p className="text-sm text-gray-500">Click to correct ur grammar</p>
      <h3 className="font-semibold text-lg">
        Change "{original}" to "{corrected}"
      </h3>
    </div>
  );
};

export default RecommendationCard;
