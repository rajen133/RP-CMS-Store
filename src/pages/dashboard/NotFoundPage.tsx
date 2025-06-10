
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold mt-4 text-gray-800">Page not found</h2>
      <p className="text-gray-600 mt-2 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link to="/dashboard">
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
