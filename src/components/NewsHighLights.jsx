'use client';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse h-96">
    <div className="h-48 bg-gray-300 w-full" />
    <div className="p-6 space-y-3 flex flex-col h-48">
      <div className="h-5 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-10 bg-gray-300 rounded w-32 mt-auto" />
    </div>
  </div>
);

export default function NewsHighlights() {
  const [newslater, setNewslater] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  // Memoized functions for performance
  const stripHtml = useCallback((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }, []);

  const truncateText = useCallback((text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }, []);

  useEffect(() => {
    const fetchBlogs = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);
        setRetrying(retryCount > 0);
        const response = await axios.get(`/api/blog`);
        // Validate blog data structure
        const blogs = Array.isArray(response.data.blogs)
          ? response.data.blogs.filter(
              (blog) =>
                blog._id &&
                blog.title &&
                blog.content &&
                blog.bannerImage &&
                blog.slug
            )
          : [];
        setNewslater(blogs);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        if (error.response?.status === 500 && retryCount < 2) {
          setTimeout(() => {
            fetchBlogs(retryCount + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        setError(error.response?.data?.message || error.message || 'Failed to load blogs');
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };
    fetchBlogs();
  }, []);

  // Fallback image for broken URLs
  const fallbackImage = '/images/fallback-news.jpg';

  return (
    <section className="bg-blue-50 py-12 px-4 md:px-20" aria-label="News and Highlights Section">
      <style jsx>{`
        .mySwiper .swiper-slide {
          height: 24rem !important;
          display: flex !important;
        }
        .mySwiper .swiper-slide > div {
          height: 100% !important;
        }
      `}</style>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-[#003366]">
        News and Highlights
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" aria-live="polite">
          {[...Array(3)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8" aria-live="assertive">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium mb-2">Unable to load news highlights</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
              aria-label="Retry loading news highlights"
            >
              {retrying ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-red-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Retrying...
                </span>
              ) : (
                'Try Again'
              )}
            </button>
          </div>
        </div>
      ) : newslater.length === 0 ? (
        <div className="text-center py-8" aria-live="polite">
          <p className="text-gray-600">No blogs available at the moment.</p>
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView="auto"
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: true }}
          loop={true}
          className="mySwiper"
          style={{
            '--swiper-slide-height': '24rem',
          }}
          aria-label="News highlights carousel"
        >
          {newslater.slice(0, 6).map((blog, idx) => (
            <SwiperSlide
              key={blog._id}
              style={{ height: '24rem' }}
              className="!h-96"
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="h-48 overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={blog.bannerImage || fallbackImage}
                    alt={blog.title}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => (e.target.src = fallbackImage)}
                  />
                  <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                    NEWS POST
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow h-48">
                  <h3 className="font-semibold text-lg mb-3 text-[#003366] line-clamp-2 h-14 flex-shrink-0">
                    {blog.title}
                  </h3>
                  <p className="text-gray-700 mb-4 line-clamp-3 text-sm flex-grow overflow-hidden">
                    {truncateText(stripHtml(blog.content), 120)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    <button
                      onClick={() => window.location.href = `/blog/${blog.slug}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded transition-colors duration-300"
                      aria-label={`Read more about ${blog.title}`}
                    >
                      READ MORE →
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}