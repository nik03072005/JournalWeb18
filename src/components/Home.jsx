'use client';
import axios from "axios";
import Navbar from "./Navbar";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import useAuthStore from '@/utility/justAuth';
import ProfileDropdown from './ProfileDropdown';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    articles: 0,
    books: 0,
    journals: 0,
    loading: true
  });
  const [animatedNumbers, setAnimatedNumbers] = useState({
    articles: 0,
    books: 0,
    journals: 0
  });


  const { isLoggedIn, logout, hasHydrated } = useAuthStore();

  // Memoized logout handler with error handling
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      localStorage.clear();
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  }, [logout]);

  // Memoized search handler
  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      window.location.href = `/search/${encodeURIComponent(searchTerm.trim())}`;
    }
  }, [searchTerm]);

  

  // Animated counter while loading
  useEffect(() => {
    let interval;
    if (stats.loading) {
      interval = setInterval(() => {
        setAnimatedNumbers(prev => ({
          articles: Math.floor(Math.random() * 999999) + 100000,
          books: Math.floor(Math.random() * 99999) + 10000,
          journals: Math.floor(Math.random() * 9999) + 1000
        }));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [stats.loading]);

  // Number formatting
  const formatNumber = (num) => {
    if (num >= 100000) return Math.floor(num / 100000) + "L+";
    if (num >= 1000) return Math.floor(num / 1000) + "K+";
    return num + "+";
  };

  // Data fetching functions
  const fetchDOAJCount = async () => {
    try {
      const response = await axios.get('/api/doaj-stats');
      return {
        articles: response.data?.articles || 0,
        journals: response.data?.journals || 0,
        total: response.data?.total || 0
      };
    } catch {
      return { articles: 0, journals: 0, total: 0 };
    }
  };

  const fetchLocalCount = async () => {
    try {
      const response = await axios.get(`/api/journal`);
      const journals = response.data?.journals || [];
      const articleCount = journals.filter(j => j.type && !j.type.toLowerCase().includes('book')).length;
      const bookCount = journals.filter(j => j.type && j.type.toLowerCase().includes('book')).length;
      return { articles: articleCount, books: bookCount, total: journals.length };
    } catch {
      return { articles: 0, books: 0, total: 0 };
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const [doajData, localData] = await Promise.all([
        fetchDOAJCount(),
        fetchLocalCount()
      ]);
      setStats({
        articles: localData.articles + doajData.articles,
        books: localData.books,
        journals: doajData.journals,
        loading: false
      });
    } catch {
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Early return if store hasn't hydrated
  if (!hasHydrated) {
    return null;
  }

  return (
    <>
      <div
        className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50"
      >
        <Navbar />

        {/* Hero Section */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Column - Text Content */}
              <div className="space-y-8">
                {/* Decorative dots pattern - Enhanced Rectangle */}
                <div className="flex gap-2.5 mb-4 w-fit">
                  {[...Array(12)].map((_, col) => (
                    <div key={col} className="flex flex-col gap-1.5">
                      {[...Array(7)].map((_, row) => (
                        <div 
                          key={row} 
                          className="w-0.75 h-0.75 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-sm hover:scale-125 transition-transform duration-300"
                          style={{
                            opacity: 0.5 + (col * 0.025),
                            animationDelay: `${(col + row) * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Empowering Minds, Enriching Futures, Digital Access
                </h1>

                {/* Subtitle/Description */}
                <p className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-xl">
                  Access thousands of books, journals, and research papers anytime, anywhere. Your gateway to knowledge starts here.
                </p>

                {/* Search Box Label */}
                <div className="pt-2">
                  {/* <h2 className="text-gray-900 text-xl font-semibold mb-4">
                    Add Search BOX
                  </h2> */}

                  {/* Search Input */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                      type="text"
                      placeholder="Search Books, Articles, Research Papers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="flex-1 px-5 py-3.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder:text-gray-400"
                      aria-label="Search for academic resources"
                    />
                    <button
                      onClick={handleSearch}
                      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
                        !searchTerm.trim() ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      disabled={!searchTerm.trim()}
                      aria-label="Submit search"
                    >
                      <Search className="w-5 h-5" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>

                  {/* Advance Search Button */}
                  <Link href="/advanceSearch">
                    <button className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white font-semibold px-10 py-3.5 rounded-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      ADVANCE SEARCH
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Column - Illustration */}
              <div className="relative hidden lg:flex items-center justify-center">
                <div className="relative w-full">
                  {/* Main illustration container */}
                  <div className="relative w-full h-[550px] flex items-center justify-center">
                    {/* Background decorative shapes */}
                    <div className="absolute top-10 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-0 w-80 h-80 bg-gradient-to-tr from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl"></div>
                    
                    {/* Illustration image */}
                    <div className="relative z-10 flex items-center justify-center">
                      <img 
                        src="/bg.png" 
                        alt="Digital Library Illustration" 
                        className="w-full h-auto max-w-lg object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}