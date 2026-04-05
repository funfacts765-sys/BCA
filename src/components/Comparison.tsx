import React, { useState } from 'react';
import { Scale, Youtube, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  platform: 'YouTube' | 'Udemy' | 'Coursera';
  thumbnail: string;
  link: string;
  price?: string;
  duration?: string;
}

export default function Comparison() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [bestCourse, setBestCourse] = useState<Course | null>(null);

  const handleCompare = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setBestCourse(null);

    try {
      // 1. Call our existing search API
      const response = await fetch(`/api/courses/search?query=${encodeURIComponent(searchQuery)}`);
      const data: Course[] = await response.json();
      
      setResults(data);

      // 2. LOGIC: How to decide which is "Best"
      // In a real project, YouTube is best for "Quick & Free", 
      // Coursera is best for "Certificates".
      // We will pick the first YouTube result as the "Best Free" option.
      const recommended = data.find(c => c.platform === 'YouTube') || data[0];
      setBestCourse(recommended);

    } catch (err) {
      console.error("Comparison failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="text-blue-600" size={28} />
          <h2 className="text-2xl font-bold">Course Comparison</h2>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter subject (e.g. Python, Java)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={handleCompare}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Compare Now'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COMPARISON CARDS */}
          {['YouTube', 'Udemy', 'Coursera'].map((platform) => {
            const course = results.find(c => c.platform === platform);
            const isBest = bestCourse?.id === course?.id;

            return (
              <div key={platform} className={`p-6 rounded-3xl border-2 transition-all ${isBest ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    {platform === 'YouTube' && <Youtube className="text-red-600" />}
                    {platform === 'Udemy' && <BookOpen className="text-purple-600" />}
                    {platform === 'Coursera' && <GraduationCap className="text-blue-600" />}
                  </div>
                  {isBest && (
                    <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 mb-2 h-12 line-clamp-2">
                  {course ? course.title : `${searchQuery} Course`}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cost:</span>
                    <span className="font-bold">{platform === 'YouTube' ? 'FREE' : 'Paid'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Certificate:</span>
                    <span className="font-bold">{platform === 'YouTube' ? 'No' : 'Yes'}</span>
                  </div>
                </div>

                <a 
                  href={course?.link} 
                  target="_blank" 
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isBest ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  View Details
                </a>
              </div>
            );
          })}
        </div>
      )}
      
      {bestCourse && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
          <CheckCircle2 className="text-blue-600 shrink-0" size={24} />
          <div>
            <p className="font-bold text-blue-900">EduHub Analysis:</p>
            <p className="text-blue-800 text-sm">
              For <b>{searchQuery}</b>, we recommend the <b>{bestCourse.platform}</b> course. 
              {bestCourse.platform === 'YouTube' 
                ? " It offers the best value for BCA students who want to learn quickly for free." 
                : " It is the best choice if you need a professional certificate for your CV."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}