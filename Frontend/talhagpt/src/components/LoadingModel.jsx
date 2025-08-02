import React from "react";

const LoadingModel = ({ enable, children,text="Loading..." }) => {
  return (
    <div className="relative w-full h-full">
      {/* Children always render */}
      {children}

      {/* Overlay loader */}
      {enable && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 animate-pulse space-y-4">
          <svg
            className="animate-spin h-12 w-12 text-emerald-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-lg font-medium tracking-wide text-emerald-300">
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingModel;
