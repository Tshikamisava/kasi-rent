import { sequelize } from '../config/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

const APPLY_MODE = process.argv.includes('--apply');

const stripWhitespace = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[\r\n\t]+/g, '');
};

const normalizeImagesValue = (value) => {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? stripWhitespace(item) : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? stripWhitespace(item) : ''))
          .filter(Boolean);
      }
    } catch {
      // not JSON, treat as single URL/path
    }

    const single = stripWhitespace(trimmed);
    return single ? [single] : [];
  }

  return [];
};

const looksChanged = (before, after) => JSON.stringify(before) !== JSON.stringify(after);

async function run() {
  try {
    console.log('\n=== PROPERTY IMAGE URL WHITESPACE CLEANUP ===');
    console.log(`Mode: ${APPLY_MODE ? 'APPLY (writes changes)' : 'PREVIEW (no DB writes)'}`);

    const [rows] = await sequelize.query(`
      SELECT id, title, image_url, images
      FROM properties
      ORDER BY created_at DESC
    `);

    if (!rows.length) {
      console.log('No properties found.');
      return;
    }

    let changedCount = 0;
    const changes = [];

    for (const row of rows) {
      const beforeImageUrl = row.image_url;
      const afterImageUrl = typeof beforeImageUrl === 'string' ? stripWhitespace(beforeImageUrl) : beforeImageUrl;

      const beforeImages = normalizeImagesValue(row.images);
      const afterImages = beforeImages.map((url) => stripWhitespace(url)).filter(Boolean);

      const imageUrlChanged = beforeImageUrl !== afterImageUrl;
      const imagesChanged = looksChanged(beforeImages, afterImages);

      if (!imageUrlChanged && !imagesChanged) continue;

      changedCount += 1;
      changes.push({
        id: row.id,
        title: row.title,
        beforeImageUrl,
        afterImageUrl,
        beforeImages,
        afterImages,
      });

      if (APPLY_MODE) {
        await sequelize.query(
          `UPDATE properties SET image_url = :image_url, images = :images WHERE id = :id`,
          {
            replacements: {
              id: row.id,
              image_url: afterImageUrl || null,
              images: JSON.stringify(afterImages),
            },
          }
        );
      }
    }

    console.log(`\nScanned: ${rows.length} properties`);
    console.log(`Would change: ${changedCount}`);

    if (changes.length > 0) {
      console.log('\nSample changes (up to 10):');
      changes.slice(0, 10).forEach((item, idx) => {
        console.log(`\n${idx + 1}. ${item.title} (${item.id})`);
        if (item.beforeImageUrl !== item.afterImageUrl) {
          console.log(`   image_url: ${JSON.stringify(item.beforeImageUrl)} -> ${JSON.stringify(item.afterImageUrl)}`);
        }
        if (looksChanged(item.beforeImages, item.afterImages)) {
          console.log(`   images: ${JSON.stringify(item.beforeImages)} -> ${JSON.stringify(item.afterImages)}`);
        }
      });
    }

    if (!APPLY_MODE) {
      console.log('\nPreview only. Re-run with --apply to write changes.');
    } else {
      console.log('\n✅ Cleanup applied successfully.');
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
