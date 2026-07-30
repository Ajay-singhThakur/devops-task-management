import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-7xl font-bold text-blue-600">
        404
      </h1>

      <p className="text-xl text-gray-600 mt-4">
        Page Not Found
      </p>

      <Link
        to="/dashboard"
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;