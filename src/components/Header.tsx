'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Clock, Menu, X, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Clock },
    { href: '/projects', label: 'Projects', icon: null },
    { href: '/timer', label: 'Timer', icon: Clock },
    { href: '/time-entries', label: 'Entries', icon: null },
    { href: '/reports', label: 'Reports', icon: null },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  // Get user initial from email or name
  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-base-100/80 border-b border-base-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary to-secondary rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-linear-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                WorkLogix
              </h1>
              <p className="text-xs text-base-content/80 -mt-1">Time Tracking</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="header-icon w-5 h-5" />
              ) : (
                <Sun className="header-icon w-5 h-5" />
              )}
            </button>

            {/* User Avatar Dropdown */}
            {isAuthenticated && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 btn btn-ghost btn-sm hover:bg-base-200"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getUserInitial()}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-base-100 rounded-xl shadow-lg border border-base-300 py-2 z-50">
                    <div className="px-4 py-3 border-b border-base-300">
                      <p className="text-sm font-semibold text-base-content">
                        {user?.username || 'User'}
                      </p>
                      <p className="text-xs text-base-content/60 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-base-content hover:bg-base-200 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-base-content hover:bg-base-200 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-base-300 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-circle btn-sm lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="header-icon w-5 h-5" /> : <Menu className="header-icon w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-base-300">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <div className="divider my-2"></div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-sm text-base-content/70 hover:text-base-content hover:bg-base-200"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-sm text-base-content/70 hover:text-base-content hover:bg-base-200"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-lg font-medium text-sm text-error hover:bg-error/10 text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
