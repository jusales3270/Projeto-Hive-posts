const youtubedl = require('yt-dlp-exec');

async function test() {
  try {
    const url = 'https://www.facebook.com/share/v/1CUuKJPvRP/?mibextid=wwX';
    console.log('Testing fb download...');
    const result = await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: 'test-fb.mp3',
    });
    console.log('FB Success', result);
  } catch (err) {
    console.log('FB Failed:', err.message);
  }
}

test();
