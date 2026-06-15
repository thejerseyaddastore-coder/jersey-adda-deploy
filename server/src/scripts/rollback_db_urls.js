const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../config/supabase');

async function rollbackUrls() {
  console.log('--- STARTING DATABASE URL ROLLBACK ---');
  
  // Fetch all rows from jersey_images
  const { data, error } = await supabase
    .from('jersey_images')
    .select('id, url');
    
  if (error) {
    console.error('Failed to fetch from jersey_images:', error);
    process.exit(1);
  }
  
  console.log(`Found ${data.length} image rows in database. Checking for rollback...`);
  
  const oldCloud = 'dlnf5iam6';
  const newCloud = 'dalnbaeaz';
  let rollbackCount = 0;
  
  for (const row of data) {
    if (row.url && row.url.includes(newCloud)) {
      const newUrl = row.url.replace(new RegExp(newCloud, 'g'), oldCloud);
      console.log(`Rolling back ID ${row.id}: ${row.url} -> ${newUrl}`);
      
      const { error: updateError } = await supabase
        .from('jersey_images')
        .update({ url: newUrl })
        .eq('id', row.id);
        
      if (updateError) {
        console.error(`Failed to rollback ID ${row.id}:`, updateError);
      } else {
        rollbackCount++;
      }
    }
  }
  
  console.log(`\n--- DATABASE URL ROLLBACK COMPLETE ---`);
  console.log(`Successfully rolled back: ${rollbackCount} rows.`);
}

rollbackUrls().catch(err => {
  console.error('Fatal database rollback error:', err);
  process.exit(1);
});
