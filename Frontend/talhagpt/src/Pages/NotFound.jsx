import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 text-white px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-6">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 rounded-lg bg-primary hover:bg-primary/80 transition duration-200 text-white font-medium"
        >
          🔙 Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
