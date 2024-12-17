import { Home, FileCheck, FilePlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : 'hover:bg-blue-700';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">Certificate Manager</Link>
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link
                to="/issue"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/issue')}`}
              >
                <FilePlus size={18} />
                <span>Issue Certificate</span>
              </Link>
              <Link
                to="/verify"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isActive('/verify')}`}
              >
                <FileCheck size={18} />
                <span>Verify Certificate</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}