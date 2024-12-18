import React from 'react';
import { Shield, FileCheck, UserCheck, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CertiFie</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <NavLink to="/" icon={<Home className="h-5 w-5" />} text="Home" active={location.pathname === '/'} />
            <NavLink to="/admin" icon={<UserCheck className="h-5 w-5" />} text="Admin" active={location.pathname === '/admin'} />
            <NavLink to="/issuer" icon={<FileCheck className="h-5 w-5" />} text="Issuer" active={location.pathname === '/issuer'} />
            <NavLink to="/verify" icon={<Shield className="h-5 w-5" />} text="Verify" active={location.pathname === '/verify'} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ 
  to, 
  icon, 
  text, 
  active 
}: { 
  to: string; 
  icon: React.ReactNode; 
  text: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-1 transition-colors duration-200 ${
        active ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}