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
    <header className="relative bg-[#003d6b] text-white shadow-md overflow-visible z-[100]">
      {/* Top Row - Logo and Upper Menu */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
          {/* Left Side - Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Home">
            <div className="flex items-center gap-3 bg-white rounded-md px-3 py-2">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-auto" 
                loading="lazy"
              />
            </div>
          </Link>

          {/* Right Side - Upper Menu Links */}
          <div className="hidden lg:flex items-center gap-1">
            {isLoggedIn ? (
              <ProfileDropdown onLogout={handleLogout} isLoggingOut={isLoggingOut} />
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200 rounded"
                aria-label="Login"
              >
                LOGIN
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded transition-colors duration-200" 
            onClick={toggleMobileMenu}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Bottom Row - Main Navigation */}
      <div className="bg-[#002d52]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden lg:flex items-center justify-center space-x-1">
            <Link 
              href="/" 
              className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200" 
              aria-label="Home"
            >
              HOME
            </Link>

            {/* Browse Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setBrowseOpen(true)}
              onMouseLeave={() => setBrowseOpen(false)}
            >
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200 flex items-center gap-1"
                aria-expanded={browseOpen}
                aria-controls="browse-dropdown"
                aria-label="Browse content types"
              >
                BROWSE
                <ChevronDown size={16} className={`transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`} />
              </button>

              {browseOpen && (
                <div className="absolute top-full left-0 pt-2 w-64 z-[999]" id="browse-dropdown">
                  <div className="bg-[#003d6b] border border-white/20 rounded-md shadow-xl overflow-hidden">
                    <div className="py-2">
                      {browseOptions.map((option) => (
                        <Link
                          key={option}
                          href={`/type/${encodeURIComponent(option.toLowerCase().replace(/\s+/g, '-'))}`}
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200"
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
              className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200" 
              aria-label="Subjects"
            >
              SUBJECTS
            </Link>
          </nav>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-[#002d52] border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            <Link 
              href="/" 
              className="block px-4 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors duration-200"
              onClick={toggleMobileMenu}
              aria-label="Home"
            >
              HOME
            </Link>

            {/* Mobile Browse */}
            <div className="w-full">
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors duration-200"
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
                      className="block px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
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
              className="block px-4 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors duration-200"
              onClick={toggleMobileMenu}
              aria-label="Subjects"
            >
              SUBJECTS
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-2 border-t border-white/10 mt-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors duration-200 mb-2"
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
                    className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200"
                    disabled={isLoggingOut}
                    aria-label="Logout"
                  >
                    {isLoggingOut ? 'Logging out...' : 'LOGOUT'}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block px-4 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors duration-200"
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