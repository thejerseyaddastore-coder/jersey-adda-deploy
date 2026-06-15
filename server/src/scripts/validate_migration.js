const path = require('path');
// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../config/supabase');

// Hardcoded frontend static URLs (migrated to new Cloudinary account)
const staticUrls = [
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780690665/WhatsApp_Image_2026-06-06_at_01.36.22_pvwztm.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780725540/WhatsApp_Image_2026-06-06_at_11.14.52_kafncm.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780699658/national_nsvlmb.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780699661/club_i7qrny.avif',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780699658/with_shorts_pto6oq.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780860773/abhay-siby-mathew-bGMjzkeAGkQ-unsplash_ooqy03.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/barca_zobf0w.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/madrid_s8pzsx.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/united_u9rups.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/milan_mujfq4.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1781001006/11_firfjm.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1781001004/22_e8hjqj.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1781001006/33_yufkrw.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780703328/11_jqdh47.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780703329/22_jo23lw.jpg',
  'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780703335/33_ysxeqe.jpg'
];

async function checkUrlAccessibility(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) return { ok: true, status: response.status };
    
    // Cloudinary might reject HEAD or require GET for some assets, double check with a small GET if HEAD fails
    const getResponse = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    return { ok: getResponse.ok, status: getResponse.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function validateMigration() {
  console.log('--- STARTING MIGRATION VALIDATION ---');
  
  // 1. Fetch URLs from database
  const { data: dbImages, error: dbImagesError } = await supabase
    .from('jersey_images')
    .select('id, url, jersey_id');

  if (dbImagesError) {
    console.error('Failed to fetch from jersey_images:', dbImagesError);
    process.exit(1);
  }

  const oldCloudName = 'dlnf5iam6';
  const newCloudName = 'dalnbaeaz';

  let oldCloudDbCount = 0;
  let newCloudDbCount = 0;
  let otherDbCount = 0;
  let totalDbUrls = 0;

  const urlsToCheck = [];

  // Categorize database URLs
  dbImages.forEach(row => {
    if (row.url) {
      totalDbUrls++;
      if (row.url.includes(oldCloudName)) oldCloudDbCount++;
      else if (row.url.includes(newCloudName)) newCloudDbCount++;
      else otherDbCount++;
      
      urlsToCheck.push({ type: 'DB (jersey_images)', url: row.url, id: row.id });
    }
  });

  // Add static URLs
  staticUrls.forEach(url => {
    urlsToCheck.push({ type: 'Frontend Static URL', url });
  });

  console.log(`\n--- URL STATISTICS ---`);
  console.log(`Total DB URL fields checked: ${totalDbUrls}`);
  console.log(` - Pointing to OLD Cloud (${oldCloudName}): ${oldCloudDbCount}`);
  console.log(` - Pointing to NEW Cloud (${newCloudName}): ${newCloudDbCount}`);
  console.log(` - Other domains: ${otherDbCount}`);
  console.log(`Static frontend assets to check: ${staticUrls.length}`);

  console.log(`\n--- VERIFYING ACCESSIBILITY (HEAD/GET requests) ---`);
  
  let checkedCount = 0;
  let successCount = 0;
  let brokenUrls = [];

  for (let i = 0; i < urlsToCheck.length; i++) {
    const item = urlsToCheck[i];
    checkedCount++;
    
    // Log progress every 20 URLs to avoid log spamming
    if (i % 20 === 0 || i === urlsToCheck.length - 1) {
      console.log(`Verifying: ${checkedCount}/${urlsToCheck.length}...`);
    }

    const checkResult = await checkUrlAccessibility(item.url);
    if (checkResult.ok) {
      successCount++;
    } else {
      brokenUrls.push({
        type: item.type,
        url: item.url,
        error: checkResult.error || `HTTP Status Code: ${checkResult.status}`
      });
    }
  }

  console.log(`\n--- VALIDATION SUMMARY REPORT ---`);
  console.log(`Total URLs verified: ${urlsToCheck.length}`);
  console.log(`Successfully reached (200 OK): ${successCount}`);
  console.log(`Broken/Unreachable: ${brokenUrls.length}`);

  if (brokenUrls.length > 0) {
    console.log(`\n--- BROKEN URL DETAILS ---`);
    brokenUrls.forEach((broken, index) => {
      console.log(`[${index + 1}] Type: ${broken.type}`);
      console.log(`    URL: ${broken.url}`);
      console.log(`    Issue: ${broken.error}`);
    });
    console.log(`\nWARNING: Found ${brokenUrls.length} broken/unreachable images!`);
  } else {
    console.log(`\nSUCCESS: All images resolved successfully! No broken URLs detected.`);
  }

  console.log('--- VALIDATION COMPLETE ---');
}

validateMigration().catch(err => {
  console.error('Fatal validation error:', err);
  process.exit(1);
});
