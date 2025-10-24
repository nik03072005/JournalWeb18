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
    <header className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white shadow-2xl border-b border-white/10 overflow-visible z-[100] backdrop-blur-sm">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/footer-bg2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      </div>
      
      {/* Subtle Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 animate-pulse"></div>
      
      {/* Enhanced Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent backdrop-blur-[2px]"></div>
      
      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/15"></div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
          {/* Left Side - Letterhead Style Logo */}
          <Link href="/" className="group flex items-center gap-4 transition-all duration-500 hover:scale-[1.01]" aria-label="Home">
            <div className="flex items-center gap-3 bg-cyan/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 group-hover:shadow-xl group-hover:bg-cyan transition-all duration-500">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-10 w-auto drop-shadow-sm transition-all duration-500" 
                  loading="lazy"
                />
              </div>
            </div>
            {/* Digital Library Text */}
            {/* <div className="hidden sm:flex flex-col text-left">
              <h1 className="text-white text-lg font-bold tracking-wide drop-shadow-md">
                Digital Library
              </h1>
              <p className="text-white/90 text-sm font-medium tracking-wide drop-shadow-sm">
                Geetanagar College
              </p>
            </div> */}
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-1 font-medium text-sm text-gray-300">
            <Link href="/" className="relative px-5 py-3 rounded-lg hover:text-white transition-all duration-500 group hover:translate-x-0.5" aria-label="Home">
              <span className="relative z-10 tracking-wide">HOME</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

            {/* Browse Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setBrowseOpen(true)}
              onMouseLeave={() => setBrowseOpen(false)}
            >
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                className="relative px-5 py-3 rounded-lg hover:text-white transition-all duration-500 flex items-center gap-2 hover:translate-x-0.5"
                aria-expanded={browseOpen}
                aria-controls="browse-dropdown"
                aria-label="Browse content types"
              >
                <span className="relative z-10 tracking-wide">BROWSE</span>
                <ChevronDown size={15} className={`transition-all duration-500 ${browseOpen ? 'rotate-180 text-purple-400' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>

              {browseOpen && (
                <div className="absolute top-full left-0 pt-3 w-68 z-[999]" id="browse-dropdown">
                  <div className="bg-slate-900/98 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                    <div className="py-3">
                      {browseOptions.map((option) => (
                        <Link
                          key={option}
                          href={`/type/${encodeURIComponent(option.toLowerCase().replace(/\s+/g, '-'))}`}
                          className="block px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-all duration-300 group relative"
                          onClick={() => setBrowseOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full transition-all duration-300"></div>
                            <span className="tracking-wide">{option}</span>
                          </div>
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/subjects" className="relative px-5 py-3 rounded-lg hover:text-white transition-all duration-500 group hover:translate-x-0.5" aria-label="Subjects">
              <span className="relative z-10 tracking-wide">SUBJECTS</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          </nav>

          {/* Right Side - Compact Premium Login */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <ProfileDropdown onLogout={handleLogout} isLoggingOut={isLoggingOut} />
            ) : (
              <Link
                href="/auth"
                className="group relative flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] border border-white/10 hover:border-white/20"
                aria-label="Login"
              >
                <User size={16} className="text-white/90 group-hover:text-white transition-colors duration-300" />
                <span className="font-medium tracking-wide">LOGIN</span>
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <button 
            className="md:hidden p-2.5 text-white hover:bg-white/12 rounded-xl transition-all duration-500 group" 
            onClick={toggleMobileMenu}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <div className="relative">
              {open ? <X size={24} className="drop-shadow-sm transition-transform duration-500 rotate-180" /> : <Menu size={24} className="drop-shadow-sm transition-transform duration-500" />}
              <div className="absolute inset-0 bg-blue-500/15 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu - Footer Inspired */}
      {open && (
        <div className="md:hidden relative z-[999]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
          <div className="relative bg-gradient-to-br from-slate-900/98 via-blue-900/98 to-slate-800/98 backdrop-blur-sm border-t border-white/10 shadow-2xl">
            <div className="px-6 py-6 space-y-4">
              <Link 
                href="/" 
                className="flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300 group hover:translate-x-2 px-4 py-3 rounded-lg"
                onClick={toggleMobileMenu}
                aria-label="Home"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 transition-colors duration-300"></div>
                <span>HOME</span>
              </Link>

              {/* Mobile Browse */}
              <div className="w-full">
                <button
                  onClick={() => setBrowseOpen(!browseOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                  aria-expanded={browseOpen}
                  aria-controls="mobile-browse-dropdown"
                  aria-label="Browse content types"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span>BROWSE</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${browseOpen ? 'rotate-180' : ''}`} />
                </button>
                {browseOpen && (
                  <div className="mt-2 ml-4 space-y-1 max-h-48 overflow-y-auto" id="mobile-browse-dropdown">
                    {browseOptions.map((option) => (
                      <Link
                        key={option}
                        href={`/type/${encodeURIComponent(option.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="flex items-center px-4 py-2 text-xs text-gray-400 hover:text-white transition-all duration-200 group hover:translate-x-2"
                        onClick={toggleMobileMenu}
                      >
                        <div className="w-1 h-1 bg-purple-400 rounded-full mr-2 transition-colors duration-200"></div>
                        {option}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                href="/subjects" 
                className="flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300 group hover:translate-x-2 px-4 py-3 rounded-lg"
                onClick={toggleMobileMenu}
                aria-label="Subjects"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 transition-colors duration-300"></div>
                <span>SUBJECTS</span>
              </Link>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-white/10">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-between px-4 py-3 text-sm text-blue-400 hover:text-white transition-all duration-300 mb-2 rounded-lg hover:bg-blue-500/10"
                      onClick={toggleMobileMenu}
                      aria-label="Dashboard"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span>DASHBOARD</span>
                      </div>
                      <ArrowRight size={16} />
                    </Link>
                    <button
                      onClick={() => {
                        toggleMobileMenu();
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      disabled={isLoggingOut}
                      aria-label="Logout"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                        <span>{isLoggingOut ? 'Logging out...' : 'LOGOUT'}</span>
                      </div>
                      <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center justify-between px-4 py-3 text-sm text-blue-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-blue-500/10"
                    onClick={toggleMobileMenu}
                    aria-label="Login"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span>LOGIN</span>
                    </div>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}