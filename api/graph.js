// Vercel serverless function — /api/graph
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    roads: [],
    facilities: [],
    zones: [],
    assets: [],
    timestamp: new Date().toISOString(),
  });
}
