import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <AlertCircle className="h-16 w-16 text-blue-600" />
      <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
      <p className="text-gray-600 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button icon={AlertCircle}>Return Home</Button>
      </Link>
    </div>
  );
}