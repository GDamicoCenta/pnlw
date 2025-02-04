import React from "react";

const TableSkeleton: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full min-h-[200px]">
      <div className="animate-pulse flex flex-col gap-4 w-3/4">
        <div className="skeleton h-8 w-full bg-gray-700 mx-auto"></div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-gray-700 skeleton h-6 w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
