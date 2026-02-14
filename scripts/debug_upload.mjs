
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qqwizcszvhfckemoswye.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxd2l6Y3N6dmhmY2tlbW9zd3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTQ4OTEsImV4cCI6MjA4NDgzMDg5MX0.86h75hc9OeqeGqnhNkqKi8KL824sq1IxTMlt4r35Nlk';

const supabase = createClient(supabaseUrl, supabaseKey);

const bucket = 'products';
// Attempting to simulate what NavbarController does
// It uploads an image. Text file might be rejected if policy enforces mime type.
// But let's try text first, simpler.
const path = 'uploads/navbar/test_debug_upload.txt'; 
const fileBody = 'Test content';

async function testUpload() {
  console.log(`Testing upload to bucket '${bucket}' at path '${path}'...`);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBody, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    console.error('SERVER ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS:', data);
    
    // Check public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    console.log('Public URL:', publicUrlData.publicUrl);
  }
}

testUpload();
