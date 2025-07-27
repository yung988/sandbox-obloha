import { put } from '@vercel/blob';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Načíst environment proměnné z .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function uploadImages() {
  console.log('🚀 Začínám nahrávání obrázků do Vercel Blob Storage...');
  
  const publicDir = join(__dirname, '..', 'public');
  
  // Najít všechny obrázky v public složce
  const imageFiles = readdirSync(publicDir).filter(file => 
    file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  console.log(`📁 Nalezeno ${imageFiles.length} obrázků v public složce:`);
  imageFiles.forEach(file => console.log(`  - ${file}`));

  let uploaded = 0;
  let failed = 0;

  for (const filename of imageFiles) {
    try {
      const filePath = join(publicDir, filename);
      const fileBuffer = readFileSync(filePath);
      
      console.log(`⬆️ Nahrávám ${filename} (${Math.round(fileBuffer.length / 1024)}KB)...`);
      
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: getContentType(filename),
        addRandomSuffix: false // zachovat původní jména
      });
      
      console.log(`✅ ${filename} úspěšně nahrán: ${blob.url}`);
      uploaded++;
      
      // Krátká pauza mezi uploady
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Chyba při nahrávání ${filename}:`, error.message);
      failed++;
    }
  }
  
  console.log(`\n🎉 Nahrávání dokončeno!`);
  console.log(`✅ Úspěšně nahráno: ${uploaded} obrázků`);
  console.log(`❌ Neúspěšné: ${failed} obrázků`);
}

function getContentType(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

// Spustit upload
uploadImages()
  .then(() => {
    console.log('🏁 Script dokončen');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Kritická chyba:', error);
    process.exit(1);
  });
