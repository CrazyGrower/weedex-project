import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];
// Utiliser le chemin absolu dans le conteneur Docker
const sourceIcon = join('/app/src/assets/logo.svg');
const outputDir = join('/app/public/icons');

// Créer le répertoire de sortie s'il n'existe pas
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Générer les icônes pour chaque taille
for (const size of sizes) {
  try {
    await sharp(sourceIcon)
      .resize(size, size)
      .png() // Convertir en PNG
      .toFile(join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  } catch (err) {
    console.error(`Error generating icon-${size}x${size}.png:`, err);
  }
} 