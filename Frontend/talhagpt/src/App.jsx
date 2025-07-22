import React, { Suspense, lazy } from "react";
import { Routes, Route,Navigate } from "react-router-dom";
const RouteSlicer=lazy(()=>import("./routes/RouteSlicer"))
const NotFound=lazy(()=>import("./Pages/NotFound"))

function App() {
  return (
    <Suspense fall  fallback={
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white animate-pulse space-y-4">
      <svg
        className="animate-spin h-12 w-12 text-indigo-500"
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
      <p className="text-lg font-medium tracking-wide text-indigo-300">
        Preparing your experience...
      </p>
    </div>
  }>
      <Routes>
         
        <Route path="*" element={<NotFound />} />
        <Route path="/persona/*" element={<RouteSlicer />} />
        <Route path="/" element={<Navigate to={"/persona/main"} />} />
      </Routes>
    </Suspense>
  );
}

export default App;
