import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-lg py-sm max-w-container-max mx-auto h-20">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-md">
          <Link to="/" className="font-display-lg text-headline-lg font-extrabold text-primary tracking-tight">
            Lumina Hotels
          </Link>
          <nav className="hidden md:flex gap-md ml-lg">
            <Link
              to="/hotels"
              className={`font-body-md text-body-md transition-colors duration-200 ${
                isActive('/hotels')
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Hotels
            </Link>
            <a href="#about" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">
              About Us
            </a>
            <a href="#contact" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">
              Contact
            </a>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-base">
          {user ? (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-md py-xs rounded-full font-label-md text-label-md border border-outline hover:bg-surface-variant transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="px-md py-xs rounded-full font-label-md text-label-md border border-outline hover:bg-surface-variant transition-all"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-md py-xs rounded-full font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth?mode=login"
                className="px-md py-xs rounded-full font-label-md text-label-md border border-outline hover:bg-surface-variant transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                className="px-md py-xs rounded-full font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-sm text-on-surface hover:text-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-outline-variant/30 py-md px-lg flex flex-col gap-sm shadow-md animate-in fade-in slide-in-from-top-5 duration-200">
          <Link
            to="/hotels"
            onClick={() => setMobileMenuOpen(false)}
            className={`font-label-md py-xs ${isActive('/hotels') ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            Hotels
          </Link>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-on-surface-variant py-xs"
          >
            About Us
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-on-surface-variant py-xs"
          >
            Contact
          </a>
          <hr className="border-outline-variant/30" />
          {user ? (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="font-label-md text-on-surface-variant py-xs"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="font-label-md text-on-surface-variant py-xs"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left font-label-md text-error py-xs"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-sm pt-xs">
              <Link
                to="/auth?mode=login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-xs border border-outline rounded-lg font-label-md text-label-md"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-xs bg-primary text-on-primary rounded-lg font-label-md text-label-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
