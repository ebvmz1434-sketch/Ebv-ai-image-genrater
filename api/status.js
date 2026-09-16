module.exports = async function handler(req, res) {
  const id = req.query.id;
  const token = process.env.REPLICATE_API_TOKEN;
  if (!id) return res.status(400).json({ error: 'No id provided' });
  if (!token) return res.status(500).json({ error: 'No API token found' });

  try {
    const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    const pred = await r.json();
    res.json(pred);
  } catch (e) {
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
};
