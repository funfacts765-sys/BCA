import React, { useState, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  PenTool, 
  Settings, 
  LogOut, 
  Bell,
  GraduationCap,
  Menu,
  X,
  Library,
  ChevronLeft,
  ChevronRight,
  Scale
} from 'lucide-react';
import CourseSearch from './components/CourseSearch';
import StudyTracker from './components/StudyTracker';
import Notes from './components/Notes';
import SubjectNotes from './components/SubjectNotes';
import Comparison from './components/Comparison';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import Profile from './components/Profile';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'courses' | 'notes' | 'subjects' | 'comparison' | 'profile';

interface User {
  name: string;
  email: string;
  github?: {
    login: string;
    avatar_url: string;
  };
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  const [courseResults, setCourseResults] = useState<any[]>([]);
  const [hasSearchedCourses, setHasSearchedCourses] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);

  // --- FIXED: Session & Auth Logic ---
  useEffect(() => {
    // Check if a session (Guest or GitHub) exists on the server
    fetch('/api/user/github')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setGithubUser(data);
          // Automatically set the local user state so the Login screen disappears
          setUser({
            name: data.name || 'BCA Student',
            email: 'student@eduhub.com',
            github: data.login ? data : undefined
          });
        }
      })
      .catch(() => console.log("No active session found."));

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const authUser = event.data.user;
        setGithubUser(authUser);
        setUser({
          name: authUser.name,
          email: 'github-user@eduhub.com',
          github: authUser
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- FIXED: Logout Logic ---
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/github/logout', { method: 'POST' });
      setUser(null);
      setGithubUser(null);
      // Optional: Clear local results
      setCourseResults([]);
      setHasSearchedCourses(false);
    } catch (err) {
      console.error("Logout failed", err);
      setUser(null); // Force logout locally anyway
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Explore Courses', icon: BookOpen },
    { id: 'comparison', label: 'Comparison', icon: Scale },
    { id: 'subjects', label: 'Subject Notes', icon: Library },
    { id: 'notes', label: 'My Notes', icon: PenTool },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      setActiveTab('courses');
      // Dispatch event to CourseSearch component
      const event = new CustomEvent('trigger-global-search', { detail: globalSearch });
      window.dispatchEvent(event);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-[70] bg-white border-r border-gray-100 transition-all duration-500
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarCollapsed ? 'w-20' : 'w-72'}
        lg:relative lg:translate-x-0 shadow-2xl shadow-gray-200/50 lg:shadow-none
      `}>
        <div className="flex flex-col h-full relative">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-4 top-12 w-8 h-8 bg-white border border-gray-100 rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all z-[80] text-gray-400 hover:text-blue-600 hover:scale-110"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className={`p-8 flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-4' : ''}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0 transform hover:rotate-12 transition-transform">
              <GraduationCap size={24} />
            </div>
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-black tracking-tight text-gray-900"
              >
                EduHub
              </motion.span>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                title={isSidebarCollapsed ? item.label : ''}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group relative
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                `}
              >
                <item.icon size={20} className={activeTab === item.id ? '' : 'group-hover:scale-110 transition-transform'} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className={`p-4 mt-auto border-t border-gray-50 ${isSidebarCollapsed ? 'px-2' : ''}`}>
            {!isSidebarCollapsed && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                {githubUser ? (
                  <div className="flex items-center gap-3">
                    <img src={githubUser.avatar_url} className="w-8 h-8 rounded-lg" alt="Avatar" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{githubUser.name || githubUser.login}</p>
                      <p className="text-[10px] text-gray-500 truncate">@{githubUser.login || 'Guest'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Standard Plan</p>
                    <p className="text-[11px] text-gray-500">BCA Learning Portal</p>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 px-4 py-3 text-gray-500 font-bold hover:text-red-600 transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <LogOut size={20} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 capitalize hidden sm:block">
              {activeTab === 'dashboard' ? 'Learning Dashboard' : activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search courses (e.g. React)..." 
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </form>
            <button className="relative p-2 text-gray-400 hover:text-gray-900">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none mb-1">{githubUser?.name || user.name}</p>
                <p className="text-xs text-gray-400">Student</p>
              </div>
              <img 
                src={githubUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                className="w-10 h-10 rounded-xl bg-blue-50 border border-gray-100 object-cover"
                alt="Profile" 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <StudyTracker />
                      </div>
                      <div className="space-y-8">
                        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                          <h3 className="text-2xl font-bold mb-2">BCA Study Hub</h3>
                          <p className="text-blue-100 mb-6">Master your semester with AI-powered notes and course search.</p>
                          <button 
                            onClick={() => setActiveTab('courses')}
                            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-2xl hover:shadow-lg transition-all"
                          >
                            Explore Now
                          </button>
                          <GraduationCap size={120} className="absolute -bottom-4 -right-4 text-blue-500/30 rotate-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'courses' && (
                  <CourseSearch 
                    initialQuery={globalSearch} 
                    persistedResults={courseResults}
                    setPersistedResults={setCourseResults}
                    hasSearched={hasSearchedCourses}
                    setHasSearched={setHasSearchedCourses}
                  />
                )}
                {activeTab === 'subjects' && <SubjectNotes />}
                {activeTab === 'notes' && <Notes />}
                {activeTab === 'comparison' && <Comparison />}
                {activeTab === 'profile' && <Profile />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}