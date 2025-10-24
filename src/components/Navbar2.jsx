'use client';
import { useState, useCallback, useEffect } from 'react';
import { Menu, X, ChevronDown, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import ProfileDropdown from './ProfileDropdown';
import useAuthStore from '@/utility/justAuth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isLoggedIn, logout, hasHydrated } = useAuthStore();

  // Memoized logout handler with error handling
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      localStorage.clear();
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  // Expanded browse options
  const browseOptions = [
    'Book', 'Book Chapters', 'Conference Proceeding', 'Dissertation',
    'Magazine', 'Manuscript', 'Newspaper', 'Question Papers', 
    'Research Papers', 'Thesis'
  ];

  // Memoized handler for toggling mobile menu
  const toggleMobileMenu = useCallback(() => {
    setOpen((prev) => !prev);
    if (browseOpen) setBrowseOpen(false);
  }, [browseOpen]);



  // Early return if store hasn't hydrated
  if (!hasHydrated) {
    return null;
  }

  return (
    <header className="relative bg-white text-gray-900 shadow-md overflow-visible z-[100]">
      {/* Single Row - Logo, Navigation, and Auth */}
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center px-4 sm:px-6 lg:px-8 py-4">
        {/* Left Side - Logo */}
        <Link href="/" className="flex items-center gap-3 group justify-self-start" aria-label="Home">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-12 w-auto" 
              loading="lazy"
            />
          </div>
        </Link>

        {/* Center - Main Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center space-x-8">
          <Link 
            href="/" 
            className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center h-12" 
            aria-label="Home"
          >
            HOME
          </Link>

          {/* Browse Dropdown */}
          <div
            className="relative flex items-center h-12"
            onMouseEnter={() => setBrowseOpen(true)}
            onMouseLeave={() => setBrowseOpen(false)}
          >
            <button
              onClick={() => setBrowseOpen(!browseOpen)}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 h-full"
              aria-expanded={browseOpen}
              aria-controls="browse-dropdown"
              aria-label="Browse content types"
            >
              BROWSE
              <ChevronDown size={16} className={`transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`} />
            </button>

            {browseOpen && (
              <div className="absolute top-full left-0 pt-2 w-64 z-[999]" id="browse-dropdown">
                <div className="bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden">
                  <div className="py-2">
                    {browseOptions.map((option) => (
                      <Link
                        key={option}
                        href={`/type/${encodeURIComponent(option.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setBrowseOpen(false)}
                      >
                        {option}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link 
            href="/subjects" 
            className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center h-12" 
            aria-label="Subjects"
          >
            SUBJECTS
          </Link>
        </nav>

        {/* Right Side - Auth Section */}
        <div className="hidden lg:flex items-center gap-4 justify-self-end">
          {isLoggedIn ? (
            <ProfileDropdown onLogout={handleLogout} isLoggingOut={isLoggingOut} />
          ) : (
            <Link
              href="/auth"
              className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold px-6 py-2.5 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              aria-label="Login"
            >
              LOGIN
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button 
          className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200" 
          onClick={toggleMobileMenu}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Enhanced Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            <Link 
              href="/" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors duration-200 font-semibold"
              onClick={toggleMobileMenu}
              aria-label="Home"
            >
              HOME
            </Link>

            {/* Mobile Browse */}
            <div className="w-full">
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors duration-200 font-semibold"
                aria-expanded={browseOpen}
                aria-controls="mobile-browse-dropdown"
                aria-label="Browse content types"
              >
                <span>BROWSE</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`} />
              </button>
              {browseOpen && (
                <div className="mt-1 ml-4 space-y-1" id="mobile-browse-dropdown">
                  {browseOptions.map((option) => (
                    <Link
                      key={option}
                      href={`/type/${encodeURIComponent(option.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="block px-4 py-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                      onClick={toggleMobileMenu}
                    >
                      {option}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link 
              href="/subjects" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors duration-200 font-semibold"
              onClick={toggleMobileMenu}
              aria-label="Subjects"
            >
              SUBJECTS
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-2 border-t border-gray-200 mt-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors duration-200 mb-2 font-semibold"
                    onClick={toggleMobileMenu}
                    aria-label="Dashboard"
                  >
                    DASHBOARD
                  </Link>
                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors duration-200 font-semibold"
                    disabled={isLoggingOut}
                    aria-label="Logout"
                  >
                    {isLoggingOut ? 'Logging out...' : 'LOGOUT'}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block text-center bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold px-6 py-2.5 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={toggleMobileMenu}
                  aria-label="Login"
                >
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}