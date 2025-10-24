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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16">
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Text Content */}
              <div className="space-y-6">
                {/* Decorative dots pattern */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, row) => (
                    <div key={row} className="flex flex-col gap-1">
                      {[...Array(5)].map((_, col) => (
                        <div key={col} className="w-1 h-1 bg-white/40 rounded-full"></div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Empowering Minds, Enriching Futures, Digital Access
                </h1>

                {/* Subtitle/Description */}
                <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                  Access thousands of books, journals, and research papers anytime, anywhere. Your gateway to knowledge starts here.
                </p>

                {/* Search Box Label */}
                <div className="pt-4">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">
                    Add Search BOX
                  </h2>

                  {/* Search Input */}
                  <div className="flex gap-2 mb-6">
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
                      className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      aria-label="Search for academic resources"
                    />
                    <button
                      onClick={handleSearch}
                      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        !searchTerm.trim() ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      disabled={!searchTerm.trim()}
                      aria-label="Submit search"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Advance Search Button */}
                  <Link href="/advanceSearch">
                    <button className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white font-semibold px-8 py-3 rounded-sm transition-all duration-200 shadow-lg hover:shadow-xl">
                      ADVANCE SEARCH
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Column - Illustration */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  {/* Main illustration container */}
                  <div className="relative w-full h-[500px]">
                    {/* Background decorative shapes */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl"></div>
                    
                    {/* Illustration image */}
                    <div className="relative z-10 flex items-center justify-center h-full">
                      <img 
                        src="/bg.png" 
                        alt="Digital Library Illustration" 
                        className="w-full h-auto max-w-lg object-contain"
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