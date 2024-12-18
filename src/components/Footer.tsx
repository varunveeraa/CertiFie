import React from 'react';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-gray-600">Powered by Blockchain</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 Certificate Manager</p>
        </div>
      </div>
    </footer>
  );
}