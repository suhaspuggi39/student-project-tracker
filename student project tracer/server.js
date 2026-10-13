import express from 'express';

const app = express();

// Parse JSON request bodies up to 10 KB
app.use(express.json({ limit: '10kb' }));

// Serve frontend files
app.use(express.static('public'));

// Health-check route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => console.log(`Open http://localhost:${port}`));

