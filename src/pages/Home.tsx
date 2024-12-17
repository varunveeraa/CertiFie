import { FilePlus, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Certificate Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Blockchain-powered certificate verification platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/issue"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FilePlus className="mr-2" />
            Issue Certificate
          </Link>
          <Link
            to="/verify"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            <FileCheck className="mr-2" />
            Verify Certificate
          </Link>
        </div>
      </div>
    </div>
  );
}