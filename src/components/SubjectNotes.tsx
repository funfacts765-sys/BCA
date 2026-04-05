import React from 'react';
import { Book, ExternalLink, Code, Database, Globe, Cpu } from 'lucide-react';

interface Resource {
  name: string;
  url: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  resources: Resource[];
}

export default function SubjectNotes() {
  const subjects: Subject[] = [
    {
      id: 'web-dev',
      name: 'Web Development',
      icon: <Globe size={24} />,
      color: 'bg-blue-500',
      resources: [
        { name: 'W3Schools HTML/CSS', url: 'https://www.w3schools.com/html/', description: 'The world\'s largest web developer site.' },
        { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/', description: 'Resources for developers, by developers.' },
        { name: 'GeeksforGeeks Web', url: 'https://www.geeksforgeeks.org/web-development/', description: 'Comprehensive web development tutorials.' }
      ]
    },
    {
      id: 'dsa',
      name: 'Data Structures & Algos',
      icon: <Code size={24} />,
      color: 'bg-green-500',
      resources: [
        { name: 'GeeksforGeeks DSA', url: 'https://www.geeksforgeeks.org/data-structures/', description: 'Standard platform for DSA preparation.' },
        { name: 'Tutorials Point DSA', url: 'https://www.tutorialspoint.com/data_structures_algorithms/index.htm', description: 'Easy to follow DSA tutorials.' },
        { name: 'Programiz DSA', url: 'https://www.programiz.com/dsa', description: 'Visual learning for algorithms.' }
      ]
    },
    {
      id: 'python',
      name: 'Python Programming',
      icon: <Cpu size={24} />,
      color: 'bg-yellow-500',
      resources: [
        { name: 'W3Schools Python', url: 'https://www.w3schools.com/python/', description: 'Simple Python tutorials for beginners.' },
        { name: 'Real Python', url: 'https://realpython.com/', description: 'In-depth Python articles and tutorials.' },
        { name: 'Python.org Docs', url: 'https://docs.python.org/3/', description: 'Official Python documentation.' }
      ]
    },
    {
      id: 'database',
      name: 'Database & SQL',
      icon: <Database size={24} />,
      color: 'bg-purple-500',
      resources: [
        { name: 'W3Schools SQL', url: 'https://www.w3schools.com/sql/', description: 'Learn SQL with interactive examples.' },
        { name: 'SQLZoo', url: 'https://sqlzoo.net/', description: 'Interactive SQL tutorial.' },
        { name: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/', description: 'SQL for data analysis.' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Resources</h2>
        <p className="text-gray-500">Quick access to the best educational notes and documentation across the web.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className={`p-6 ${subject.color} text-white flex items-center gap-4`}>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                {subject.icon}
              </div>
              <h3 className="text-xl font-bold">{subject.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              {subject.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {resource.name}
                    </h4>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
          <Book size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-1">Need more specific notes?</h3>
          <p className="text-blue-700">Use the AI Assistant in the bottom right to generate custom study summaries or explain complex topics!</p>
        </div>
      </div>
    </div>
  );
}
