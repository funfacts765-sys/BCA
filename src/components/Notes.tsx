import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number; // Store as number for easy serialization
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('eduhub_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse notes', e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('eduhub_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Auto-save active note changes to the notes list
  useEffect(() => {
    if (!activeNoteId) return;
    
    const timeoutId = setTimeout(() => {
      setNotes(prevNotes => prevNotes.map(n => 
        n.id === activeNoteId ? { ...n, title, content, timestamp: Date.now() } : n
      ));
    }, 500); // Debounce save

    return () => clearTimeout(timeoutId);
  }, [title, content, activeNoteId]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      timestamp: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
  };

  const saveNote = () => {
    if (!activeNoteId) return;
    const updatedNotes = notes.map(n => 
      n.id === activeNoteId ? { ...n, title, content, timestamp: Date.now() } : n
    );
    setNotes(updatedNotes);
    // Show a small feedback if needed, but the UI updates automatically
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex h-[600px]">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-900">My Notes</h3>
          <button 
            onClick={addNote}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.length === 0 && (
            <div className="text-center py-10">
              <FileText size={40} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No notes yet</p>
            </div>
          )}
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => {
                setActiveNoteId(note.id);
                setTitle(note.title);
                setContent(note.content);
              }}
              className={`w-full text-left p-4 rounded-2xl transition-all ${
                activeNoteId === note.id 
                  ? 'bg-white shadow-md border-blue-100 ring-1 ring-blue-100' 
                  : 'hover:bg-white hover:shadow-sm border-transparent'
              } border`}
            >
              <h4 className="font-bold text-gray-900 truncate mb-1">{note.title}</h4>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {format(note.timestamp, 'MMM d, h:mm a')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {activeNoteId ? (
          <>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none flex-1"
                placeholder="Note Title"
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={saveNote}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Save Note"
                >
                  <Save size={20} />
                </button>
                <button 
                  onClick={() => deleteNote(activeNoteId)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Note"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-8 text-gray-700 leading-relaxed outline-none resize-none bg-transparent"
              placeholder="Start writing your thoughts..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <FileText size={64} className="mb-4 opacity-10" />
            <p>Select a note or create a new one to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
