const youtubedl = require('yt-dlp-exec');
const fs = require('fs');

async function test() {
  try {
    const url = 'https://www.facebook.com/share/v/1CUuKJPvRP/?mibextid=wwX';
    console.log('Testing fb download without extractAudio...');
    const result = await youtubedl(url, {
      maxFilesize: '25m',
      output: 'test-fb-no-extract.%(ext)s',
    });
    console.log('FB Success');
  } catch (err) {
    console.log('FB Failed:', err.message);
  }
}

test();
