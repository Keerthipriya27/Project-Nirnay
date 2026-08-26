// Vercel serverless function — /api/health
export default function handler(req, res) {
  res.json({ status: 'ok', service: 'Nirnay Emergency Decision Engine' });
}
