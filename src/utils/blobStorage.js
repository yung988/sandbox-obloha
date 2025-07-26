import { put, list } from "@vercel/blob";

// Upload image to blob storage
export async function uploadImage(file, filename) {
  try {
    const { url } = await put(`images/${filename}`, file, { 
      access: 'public' 
    });
    return url;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw error;
  }
}

// Get all images from blob storage
export async function getBlobImages() {
  try {
    const { blobs } = await list({ prefix: 'images/' });
    return blobs.map(blob => blob.url);
  } catch (error) {
    console.error('Error fetching from blob:', error);
    return [];
  }
}

// Predefined blob URLs (if you already uploaded them)
// Replace these with your actual blob URLs
export const BLOB_IMAGES = [
  // Add your blob URLs here, for example:
  // "https://your-blob-url.vercel-storage.com/images/img1.jpg",
  // "https://your-blob-url.vercel-storage.com/images/img2.jpg",
  // ... etc
];

// Fallback function to get image URLs
export function getImageUrl(index) {
  // If you have blob URLs, use them, otherwise fall back to public folder
  if (BLOB_IMAGES.length > 0) {
    return BLOB_IMAGES[index % BLOB_IMAGES.length];
  }
  // Fallback to public folder
  return `/img${(index % 10) + 1}.jpg`;
}
