import { list } from '@vercel/blob';

// Cache for blob images
let blobImagesCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all blob images
export async function fetchBlobImages() {
  try {
    // Check if we have cached data that's still fresh
    if (blobImagesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return blobImagesCache;
    }

    console.log('Fetching blob images...');
    const { blobs } = await list();
    
    // Filter for image files and sort them
    const imageBlobs = blobs
      .filter(blob => blob.contentType?.startsWith('image/'))
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map(blob => blob.url);

    // Cache the results
    blobImagesCache = imageBlobs;
    cacheTimestamp = Date.now();

    console.log(`Loaded ${imageBlobs.length} blob images`);
    return imageBlobs;
  } catch (error) {
    console.error('Error fetching blob images:', error);
    return [];
  }
}

// Get image URL by index with fallback
export async function getBlobImageUrl(index) {
  try {
    const images = await fetchBlobImages();
    if (images.length > 0) {
      return images[index % images.length];
    }
  } catch (error) {
    console.error('Error getting blob image:', error);
  }
  
  // Fallback to public folder
  return `/img${(index % 10) + 1}.jpg`;
}

// Hook for React components to use blob images (moved to component level)
// Use fetchBlobImages() directly in your components with useState and useEffect
