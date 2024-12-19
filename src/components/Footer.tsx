import { Shield, Link } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white py-6 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-blue-500" />
            <span className="text-gray-700 font-medium text-base">
              Built on <strong className="text-blue-500">Web3</strong>
            </span>
          </div>

          {/* Middle Section */}
          <div className="flex items-center space-x-3">
            <Link className="h-5 w-5 text-purple-500" />
            <span className="text-gray-700 font-medium text-base">
              Powered by <strong className="text-purple-500">ETH</strong>
            </span>
          </div>

          {/* Right Section */}
          <p className="text-gray-700 text-sm text-center md:text-right">
            © 2024 <strong className="text-gray-700 font-medium">CertiFie</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
