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

let savedNotes: any[] = [];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // FEATURE: Guest Login
  app.post('/api/auth/guest-login', (req, res) => {
    const guestUser = { id: 'bca_student', name: 'EduHub Learner' };
    res.cookie('github_user', JSON.stringify(guestUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
    });
    res.json(guestUser);
  });

  // FEATURE: Course Search
  app.get('/api/courses/search', async (req, res) => {
    const searchQuery = req.query.query || req.query.q; 
    const ytKey = process.env.YOUTUBE_API_KEY;
    if (!searchQuery) return res.status(400).json({ error: "Search term required" });
    try {
      const youtubeRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: { part: 'snippet', q: `${searchQuery} tutorial`, type: 'video', maxResults: 6, key: ytKey }
      });
      const youtubeCourses = youtubeRes.data.items.map((item: any) => ({
        id: item.id.videoId, title: item.snippet.title, thumbnail: item.snippet.thumbnails.high.url, platform: 'YouTube', link: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
      res.json(youtubeCourses);
    } catch (error) {
      res.status(500).json({ error: "Check API Key" });
    }
  });

  // FEATURE: Saving Notes
  app.post('/api/notes/save', (req, res) => {
    const { title, content, subject } = req.body;
    const newNote = { id: Date.now().toString(), title, content, subject, date: new Date().toLocaleDateString() };
    savedNotes.push(newNote);
    res.json({ success: true, note: newNote });
  });

  app.get('/api/notes', (req, res) => {
    res.json(savedNotes);
  });

  // FEATURE: AI Doubt Clear
  app.post('/api/ai/doubt-clear', async (req, res) => {
    res.json({ answer: "AI is ready for your BCA project!" });
  });

  // ONLINE DEPLOYMENT LOGIC
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`🚀 EduHub is live!`);
  });
}

startServer();