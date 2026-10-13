
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files from the public folder.
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON request bodies, with a 10 KB limit.
app.use(express.json({ limit: '10kb' }));

// Health-check route.
app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

