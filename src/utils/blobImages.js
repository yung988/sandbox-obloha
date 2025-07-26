// Cache for blob images
let blobImagesCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all blob images via API endpoint
export async function fetchBlobImages() {
  try {
    // Check if we have cached data that's still fresh
    if (blobImagesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log(`Using cached ${blobImagesCache.length} blob images`);
      return blobImagesCache;
    }

    console.log('Fetching blob images via API...');
    const response = await fetch('/api/images');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const imageUrls = data.images || [];

    // Cache the results
    blobImagesCache = imageUrls;
    cacheTimestamp = Date.now();

    console.log(`Loaded ${imageUrls.length} blob images from API`);
    return imageUrls;
  } catch (error) {
    console.error('Error fetching blob images:', error);
    // Fallback to empty array - components will use local images
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

// Batch loading for performance
export async function fetchBlobImagesBatch(batchSize = 50) {
  try {
    const allImages = await fetchBlobImages();
    const batches = [];
    
    for (let i = 0; i < allImages.length; i += batchSize) {
      batches.push(allImages.slice(i, i + batchSize));
    }
    
    return batches;
  } catch (error) {
    console.error('Error creating image batches:', error);
    return [];
  }
}
