import React, { useState, useEffect } from 'react';
import { Github, LogOut, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface GithubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

export default function Profile() {
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGithubUser();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        setGithubUser(event.data.user);
        setError(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchGithubUser = async () => {
    try {
      const response = await fetch('/api/user/github');
      if (response.ok) {
        const data = await response.json();
        setGithubUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch GitHub user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      window.open(
        url,
        'github_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      setError('Failed to initiate GitHub connection');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/github/logout', { method: 'POST' });
      setGithubUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-500">Manage your connected accounts and profile preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GitHub Connection Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Github size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">GitHub Account</h3>
              <p className="text-sm text-gray-500">Link your GitHub to EduHub</p>
            </div>
          </div>

          {githubUser ? (
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.login} 
                  className="w-16 h-16 rounded-xl border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{githubUser.name || githubUser.login}</p>
                  <p className="text-sm text-gray-500 truncate">@{githubUser.login}</p>
                </div>
                <div className="text-green-500">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                  href={githubUser.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                >
                  View Profile <ExternalLink size={18} />
                </a>
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Disconnect GitHub
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex-1">
              <p className="text-gray-600 leading-relaxed">
                Connect your GitHub account to sync your repositories, showcase your projects, and track your coding progress within EduHub.
              </p>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                  <AlertCircle size={18} />
                  <p>{error}</p>
                </div>
              )}

              <button 
                onClick={handleConnect}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black shadow-xl shadow-gray-200 transition-all group mt-auto"
              >
                <Github size={20} />
                Connect GitHub Account
              </button>
            </div>
          )}
        </div>

        {/* Other Settings Placeholder */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Email Preferences</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
          <p className="text-gray-500 italic">Manage your notification settings and email updates.</p>
        </div>
      </div>
    </div>
  );
}
