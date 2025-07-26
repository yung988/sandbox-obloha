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
    
    console.log(`Total blobs found: ${blobs.length}`);
    console.log('Sample blob:', blobs[0]);
    
    // Filter for image files and sort them
    const imageBlobs = blobs
      .filter(blob => {
        const isImage = blob.contentType?.startsWith('image/') || 
                       blob.pathname?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        return isImage;
      })
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map(blob => blob.url);

    console.log(`Found ${imageBlobs.length} images after filtering`);
    
    res.status(200).json({
      images: imageBlobs,
      count: imageBlobs.length,
      debug: {
        totalBlobs: blobs.length,
        sampleBlob: blobs[0]
      }
    });
  } catch (error) {
    console.error('Error fetching blob images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      message: error.message 
    });
  }
}
