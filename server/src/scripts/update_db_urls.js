const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../config/supabase');

async function updateUrls() {
  console.log('--- STARTING DATABASE URL UPDATE ---');
  
  // Fetch all rows from jersey_images
  const { data, error } = await supabase
    .from('jersey_images')
    .select('id, url');
    
  if (error) {
    console.error('Failed to fetch from jersey_images:', error);
    process.exit(1);
  }
  
  console.log(`Found ${data.length} image rows in database. Checking for updates...`);
  
  const oldCloud = 'dlnf5iam6';
  const newCloud = 'dalnbaeaz';
  let updateCount = 0;
  
  for (const row of data) {
    if (row.url && row.url.includes(oldCloud)) {
      const newUrl = row.url.replace(new RegExp(oldCloud, 'g'), newCloud);
      console.log(`Updating ID ${row.id}: ${row.url} -> ${newUrl}`);
      
      const { error: updateError } = await supabase
        .from('jersey_images')
        .update({ url: newUrl })
        .eq('id', row.id);
        
      if (updateError) {
        console.error(`Failed to update ID ${row.id}:`, updateError);
      } else {
        updateCount++;
      }
    }
  }
  
  console.log(`\n--- DATABASE URL UPDATE COMPLETE ---`);
  console.log(`Successfully updated: ${updateCount} rows.`);
}

updateUrls().catch(err => {
  console.error('Fatal database update error:', err);
  process.exit(1);
});
