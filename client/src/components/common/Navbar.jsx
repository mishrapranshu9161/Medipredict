import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Activity, Bell, User as UserIcon, LogOut, Menu, X, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent tracking-tight">
                  Medi<span className="text-indigo-600">Predict</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 -mt-1 tracking-widest uppercase">
                  Hospital AI Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/doctors" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Find Doctors
            </Link>
            <Link to="/departments" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Departments
            </Link>
            {isAuthenticated && user?.role === 'patient' && (
              <Link
                to="/patient/prediction"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold hover:shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Disease Predictor</span>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markRead(null)}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-indigo-50/40' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="font-semibold text-xs text-slate-800">{n.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user.role}</span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <Badge variant="indigo" className="mt-1 uppercase text-[9px]">{user.role}</Badge>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Activity className="w-4 h-4 text-indigo-600" />
                        <span>Dashboard</span>
                      </Link>

                      {user.role === 'patient' && (
                        <Link
                          to="/patient/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          <span>My Profile</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  Register Patient
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
