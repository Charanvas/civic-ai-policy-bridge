import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Home, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-card sticky top-0 z-50 mb-8">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-primary to-primary-dark p-2 rounded-lg 
                          group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Civic AI</h1>
              <p className="text-xs text-gray-400">Policy Bridge</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-primary text-white shadow-lg shadow-primary/50'
                  : 'text-gray-400 hover:text-primary hover:bg-dark-lighter'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/dashboard')
                  ? 'bg-primary text-white shadow-lg shadow-primary/50'
                  : 'text-gray-400 hover:text-primary hover:bg-dark-lighter'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;