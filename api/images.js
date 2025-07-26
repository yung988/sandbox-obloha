import { list } from '@vercel/blob';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Fetching blob images via API...');
    const { blobs } = await list();
    
    // Filter for image files and sort them
    const imageBlobs = blobs
      .filter(blob => blob.contentType?.startsWith('image/'))
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map(blob => blob.url);

    console.log(`Found ${imageBlobs.length} images`);
    
    res.status(200).json({
      images: imageBlobs,
      count: imageBlobs.length
    });
  } catch (error) {
    console.error('Error fetching blob images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      message: error.message 
    });
  }
}
