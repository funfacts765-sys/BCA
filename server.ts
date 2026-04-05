import axios from 'axios';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temporary in-memory storage for notes (In a real BCA project, use MongoDB or a JSON file)
let savedNotes: any[] = [];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- 1. AUTH ROUTES ---
  app.post('/api/auth/guest-login', (req, res) => {
    const guestUser = { id: 'bca_student', name: 'EduHub Learner' };
    res.cookie('github_user', JSON.stringify(guestUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
    });
    res.json(guestUser);
  });

  app.post('/api/auth/github/logout', (req, res) => {
    res.clearCookie('github_user');
    res.json({ success: true });
  });

  app.get('/api/user/github', (req, res) => {
    const user = req.cookies.github_user;
    user ? res.json(JSON.parse(user)) : res.status(401).json({ error: 'Log in first' });
  });

  // --- 2. COURSE SEARCH & COMPARISON ---
  app.get('/api/courses/search', async (req, res) => {
    const searchQuery = req.query.query || req.query.q; 
    const ytKey = process.env.YOUTUBE_API_KEY;

    if (!searchQuery) return res.status(400).json({ error: "Search term required" });
    if (!ytKey) return res.status(500).json({ error: "YouTube Key missing" });

    try {
      const youtubeRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          q: `${searchQuery} tutorial`,
          type: 'video',
          maxResults: 6,
          key: ytKey
        }
      });

      const youtubeCourses = youtubeRes.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        platform: 'YouTube',
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      const extraPlatforms = [
        {
          id: 'udemy-1',
          title: `${searchQuery} Masterclass`,
          platform: 'Udemy',
          link: `https://www.udemy.com/courses/search/?q=${searchQuery}`,
          thumbnail: 'https://www.udemy.com/staticback/menu/main-menu/logo-udemy.svg'
        },
        {
          id: 'coursera-1',
          title: `${searchQuery} Professional Certificate`,
          platform: 'Coursera',
          link: `https://www.coursera.org/search?query=${searchQuery}`,
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg'
        }
      ];

      res.json([...youtubeCourses, ...extraPlatforms]);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch from YouTube API" });
    }
  });

  // --- 3. SAVING NOTES ROUTE (NEW) ---
  app.post('/api/notes/save', (req, res) => {
    const { title, content, subject } = req.body;
    
    if (!req.cookies.github_user) {
      return res.status(401).json({ error: "Please log in to save notes" });
    }

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      subject,
      date: new Date().toLocaleDateString()
    };

    savedNotes.push(newNote);
    console.log(`✅ Note Saved: ${title}`);
    res.json({ success: true, note: newNote });
  });

  app.get('/api/notes', (req, res) => {
    res.json(savedNotes);
  });

  // --- 4. AI DOUBT CLEARING ---
  app.post('/api/ai/doubt-clear', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Gemini Key missing" });
    res.json({ answer: "Gemini is ready! (Connect @google/genai library here later)" });
  });

  // --- 5. UPDATED VITE LOGIC (DO NOT REMOVE) ---
  if (process.env.NODE_ENV === 'production') {
    // Serve the actual website files when hosted on Render
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Use the development server when working on your PC
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 EduHub Server ready at http://localhost:${PORT}`);
    console.log(`✅ Gemini Key: ${process.env.GEMINI_API_KEY ? 'Detected' : 'MISSING'}`);
    console.log(`✅ YouTube Key: ${process.env.YOUTUBE_API_KEY ? 'Detected' : 'MISSING'}`);
  });
}

startServer();
