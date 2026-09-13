module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const { prompt } = req.body;
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'No API token found in environment' });
  }
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const r = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21aef19f932d7ad8cb',
        input: { prompt: prompt, num_inference_steps: 25, guidance_scale: 7.5 }
      })
    });

    let pred = await r.json();

    if (pred.error) {
      return res.status(500).json({ error: 'Replicate error: ' + pred.error });
    }

    for (let i = 0; i < 60; i++) {
      if (pred.status === 'succeeded') break;
      if (pred.status === 'failed') {
        return res.status(500).json({ error: 'Generation failed on Replicate side' });
      }
      await new Promise(s => setTimeout(s, 1500));
      const sr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      pred = await sr.json();
    }

    if (pred.status !== 'succeeded') {
      return res.status(500).json({ error: 'Timed out waiting for image' });
    }

    res.json({ url: pred.output?.[0], success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error: ' + e.message });
  }
};
