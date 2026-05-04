const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public/images');

async function optimizeImages() {
  const files = fs.readdirSync(imgDir);
  
  for (const file of files) {
    if (!file.endsWith('.png')) continue;
    
    const filePath = path.join(imgDir, file);
    const webpPath = path.join(imgDir, file.replace('.png', '.webp'));
    
    console.log(`Optimizing ${file}...`);
    
    // Check if it's a banner or product
    const isBanner = file.includes('banner') || file.includes('hero');
    const maxWidth = isBanner ? 1600 : 800; // Smaller dimensions for products
    
    await sharp(filePath)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 75 }) // Webp provides smaller files and good quality
      .toFile(webpPath);
      
    console.log(`Created ${webpPath}`);
  }
}

optimizeImages().catch(console.error);
