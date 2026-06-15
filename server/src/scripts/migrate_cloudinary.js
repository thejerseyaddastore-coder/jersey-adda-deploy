const path = require('path');
// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../config/supabase');
const cloudinary = require('cloudinary').v2;
const { extractPublicIdFromUrl } = require('../services/cloudinary.service');

// Configure the NEW Cloudinary client
const newCloudName = process.env.NEW_CLOUDINARY_CLOUD_NAME || 'dalnbaeaz';
const newApiKey = process.env.NEW_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
const newApiSecret = process.env.NEW_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

if (!newApiKey || !newApiSecret) {
  console.error('ERROR: Cloudinary API credentials not found in environment variables.');
  process.exit(1);
}

const newCloudinary = cloudinary;
newCloudinary.config({
  cloud_name: newCloudName,
  api_key: newApiKey,
  api_secret: newApiSecret,
  secure: true
});

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

function uploadImageToNewCloud(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = newCloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        unique_filename: false,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    // Write buffer to stream
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
}

// Hardcoded frontend static URLs that also need migration
const hardcodedUrls = [
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780690665/WhatsApp_Image_2026-06-06_at_01.36.22_pvwztm.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780725540/WhatsApp_Image_2026-06-06_at_11.14.52_kafncm.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780699658/national_nsvlmb.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780699661/club_i7qrny.avif',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780699658/with_shorts_pto6oq.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780860773/abhay-siby-mathew-bGMjzkeAGkQ-unsplash_ooqy03.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780696434/barca_zobf0w.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780696434/madrid_s8pzsx.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780696434/united_u9rups.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780696434/milan_mujfq4.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1781001006/11_firfjm.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1781001004/22_e8hjqj.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1781001006/33_yufkrw.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780703328/11_jqdh47.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780703329/22_jo23lw.jpg',
  'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780703335/33_ysxeqe.jpg'
];

async function runMigration() {
  console.log('--- STARTING CLOUDINARY MIGRATION ---');
  console.log(`NEW Cloud Name: ${newCloudName}`);
  
  // 1. Fetch URLs from jersey_images
  const { data: imagesData, error: imagesError } = await supabase
    .from('jersey_images')
    .select('id, url');
  
  if (imagesError) {
    console.error('Failed to fetch from jersey_images:', imagesError);
    process.exit(1);
  }

  // Map URLs to their database IDs (since a URL might be reused in multiple positions/rows)
  const urlToDbIds = {};
  (imagesData || []).forEach(row => {
    if (row.url) {
      if (!urlToDbIds[row.url]) {
        urlToDbIds[row.url] = [];
      }
      urlToDbIds[row.url].push(row.id);
    }
  });

  // 2. Collect all unique URLs pointing to old Cloudinary
  const urlsToMigrate = new Set();
  const oldCloudName = 'dlnf5iam6';

  (imagesData || []).forEach(row => {
    if (row.url && row.url.includes(oldCloudName)) {
      urlsToMigrate.add(row.url);
    }
  });

  // Add hardcoded frontend static URLs
  hardcodedUrls.forEach(url => {
    if (url.includes(oldCloudName)) {
      urlsToMigrate.add(url);
    }
  });

  const urls = Array.from(urlsToMigrate);
  console.log(`Found ${urls.length} unique images to migrate.`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const publicId = extractPublicIdFromUrl(url);
    
    if (!publicId) {
      console.log(`[${i + 1}/${urls.length}] Skipping URL (unable to extract public ID): ${url}`);
      failCount++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${urls.length}] Migrating public_id: ${publicId}...`);
      const buffer = await downloadImage(url);
      const result = await uploadImageToNewCloud(buffer, publicId);
      console.log(` -> Success! Secure URL: ${result.secure_url}`);
      
      // Update database rows associated with this URL
      const dbIds = urlToDbIds[url];
      if (dbIds && dbIds.length > 0) {
        console.log(`    Updating ${dbIds.length} database rows with the new secure URL...`);
        for (const dbId of dbIds) {
          const { error: updateError } = await supabase
            .from('jersey_images')
            .update({ url: result.secure_url })
            .eq('id', dbId);
            
          if (updateError) {
            console.error(`    Failed to update DB ID ${dbId}:`, updateError);
          }
        }
      }
      
      successCount++;
    } catch (err) {
      console.error(` -> Failed to migrate public_id: ${publicId}. Error:`, err.message);
      failCount++;
    }
  }

  console.log('\n--- MIGRATION COMPLETE ---');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed/Skipped: ${failCount}`);
  console.log(`Total: ${urls.length}`);
}

runMigration().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
