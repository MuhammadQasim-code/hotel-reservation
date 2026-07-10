import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const adminNav = [
    { name: 'Stats', path: '/admin', icon: 'analytics' },
    { name: 'Manage Hotels', path: '/admin/hotels', icon: 'hotel' },
    { name: 'Manage Reservations', path: '/admin/reservations', icon: 'event_note' },
    { name: 'Manage Users', path: '/admin/users', icon: 'group' },
    { name: 'Profile', path: '/profile', icon: 'person' }
  ];

  const userNav = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Browse Hotels', path: '/hotels', icon: 'travel_explore' },
    { name: 'My Reservations', path: '/my-reservations', icon: 'book_online' },
    { name: 'Profile', path: '/profile', icon: 'person' }
  ];

  const navItems = user.role === 'admin' ? adminNav : userNav;

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline-variant/50 flex flex-col p-md gap-base z-40 pt-24">
      {/* Brand Identity / Role Indicator */}
      <div className="mb-md px-xs">
        <h1 className="font-headline-md text-headline-md font-extrabold text-primary">
          {user.role === 'admin' ? 'Admin Portal' : 'Guest Portal'}
        </h1>
        <p className="font-label-md text-label-md text-on-surface-variant opacity-70">
          {user.role === 'admin' ? 'System Control' : 'Manage Bookings'}
        </p>
      </div>

      {/* User Avatar Card */}
      <div className="flex items-center gap-sm mb-md px-xs py-xs bg-surface-container/50 rounded-lg border border-outline-variant/20">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center font-bold text-primary border border-outline-variant">
          {user.fullName ? user.fullName.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
        </div>
        <div className="truncate">
          <p className="font-label-md text-label-md text-on-surface font-bold truncate">{user.fullName}</p>
          <p className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            {user.role === 'admin' ? 'Super Admin' : 'Valued Guest'}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-xs flex-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-sm p-sm rounded-lg transition-all duration-200 active:scale-[0.98] ${
                active
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA Button */}
      {user.role === 'admin' && (
        <Link
          to="/admin/hotels?action=add"
          className="bg-primary text-on-primary py-sm px-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:opacity-90 transition-all active:scale-[0.98] mb-sm shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            add
          </span>
          Add New Hotel
        </Link>
      )}

      {/* Footer / Sign Out */}
      <div className="flex flex-col gap-xs border-t border-outline-variant/30 pt-md">
        <button
          onClick={handleLogout}
          className="flex items-center gap-sm p-sm text-error hover:bg-error-container/20 rounded-lg transition-all w-full text-left"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            logout
          </span>
          <span className="font-label-md text-label-md font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
