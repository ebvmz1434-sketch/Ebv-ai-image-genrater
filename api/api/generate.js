export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  const { prompt } = req.body;
  const token = process.env.REPLICATE_API_TOKEN;
  
  if (!token) return res.status(500).json({ error: 'No API token' });
  if (!prompt) return res.status(400).json({ error: 'No prompt' });
  
  try {
    const r = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21aef19f932d7ad8cb',
        input: { prompt, num_inference_steps: 25, guidance_scale: 7.5 }
      })
    });
    
    let pred = await r.json();
    
    for (let i = 0; i < 120; i++) {
      if (pred.status === 'succeeded') break;
      if (pred.status === 'failed') throw new Error('Generation failed');
      await new Promise(s => setTimeout(s, 1000));
      const sr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      pred = await sr.json();
    }
    
    res.json({ url: pred.output?.[0], success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
