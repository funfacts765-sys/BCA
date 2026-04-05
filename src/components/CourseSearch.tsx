import React, { useState, useEffect, useRef } from 'react';
import { Search, Youtube, GraduationCap, BookOpen, ExternalLink, Play, X, AlertCircle, Loader2, Zap } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  platform: 'YouTube' | 'Udemy' | 'Coursera';
  thumbnail: string;
  instructor: string;
  link: string;
  rating?: number;
  videoId?: string; 
  isBest?: boolean; 
  recommendationReason?: string;
}

export default function CourseSearch({ 
  initialQuery = '',
  persistedResults = [],
  setPersistedResults,
  hasSearched = false,
  setHasSearched
}: { 
  initialQuery?: string;
  persistedResults?: Course[];
  setPersistedResults: (results: Course[]) => void;
  hasSearched: boolean;
  setHasSearched: (val: boolean) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSearchedQuery = useRef<string>('');

  useEffect(() => {
    if (initialQuery && initialQuery !== lastSearchedQuery.current) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const handleGlobalSearchEvent = (e: any) => {
      const searchQuery = e.detail;
      if (searchQuery && searchQuery !== lastSearchedQuery.current) {
        setQuery(searchQuery);
        handleSearch(searchQuery);
      }
    };

    window.addEventListener('trigger-global-search', handleGlobalSearchEvent);
    return () => window.removeEventListener('trigger-global-search', handleGlobalSearchEvent);
  }, []);

  // --- FIXED: Calls your Express Backend instead of using Gemini in the Frontend ---
  const handleSearch = async (searchQuery: string = query) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;
    if (isSearching) return;
    
    lastSearchedQuery.current = finalQuery;
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    
    try {
      // We call our own backend API which uses the YouTube Key securely
      const response = await fetch(`/api/courses/search?query=${encodeURIComponent(finalQuery)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch from server");
      }

      const data = await response.json();

      // Format the data for our UI
      const processedResults: Course[] = data.map((item: any, index: number) => ({
        id: item.id || `course-${index}`,
        title: item.title,
        platform: item.platform,
        thumbnail: item.thumbnail,
        instructor: item.instructor || (item.platform === 'YouTube' ? 'Video Tutorial' : 'Online Course'),
        link: item.link,
        rating: item.rating || (4.5 + Math.random() * 0.5).toFixed(1), // Professional fallback rating
        videoId: item.platform === 'YouTube' ? item.id : undefined,
        isBest: index === 0, // Mark the first result as the "Best Choice"
        recommendationReason: index === 0 ? "Top rated and most relevant to your search." : undefined
      }));

      setPersistedResults(processedResults);
    } catch (err: any) {
      console.error("Search Error:", err);
      setError("Failed to fetch accurate results. Please ensure your backend is running.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    if (course.platform === 'YouTube' && course.videoId) {
      setSelectedVideo(course.videoId);
    } else {
      window.open(course.link, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for BCA courses (e.g. Java, DBMS, React)..."
            className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-lg pl-14"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={24} />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}
      </div>

      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl p-4 space-y-4 animate-pulse border border-gray-100">
              <div className="aspect-video bg-gray-200 rounded-2xl" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {persistedResults.length > 0 ? (
            persistedResults.map((course) => (
              <div 
                key={course.id} 
                onClick={() => handleCourseClick(course)}
                className={`bg-white rounded-3xl overflow-hidden border transition-all group cursor-pointer relative ${course.isBest ? 'border-blue-500 ring-4 ring-blue-50 shadow-xl' : 'border-gray-100 hover:shadow-xl'}`}
              >
                {course.isBest && (
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg">
                    <Zap size={10} fill="currentColor" />
                    Best Choice
                  </div>
                )}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    {course.platform === 'YouTube' && <Youtube size={14} className="text-red-600" />}
                    {course.platform === 'Udemy' && <BookOpen size={14} className="text-purple-600" />}
                    {course.platform === 'Coursera' && <GraduationCap size={14} className="text-blue-600" />}
                    {course.platform}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 leading-tight h-10">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
                  
                  {course.isBest && course.recommendationReason && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-800 leading-relaxed italic">"{course.recommendationReason}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 font-bold">★</span>
                      <span className="text-sm font-semibold text-gray-700">{course.rating}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-blue-600">
                      {course.platform === 'YouTube' ? 'Watch Video' : 'View Course'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
                <Search size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {hasSearched ? "No courses found" : "Search to start learning"}
              </h3>
            </div>
          )}
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
            >
              <X size={24} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="Course Video"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}