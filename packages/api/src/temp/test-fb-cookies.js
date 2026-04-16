const youtubedl = require('yt-dlp-exec');

async function test() {
  try {
    const url = 'https://www.facebook.com/share/v/1CUuKJPvRP/?mibextid=wwX';
    console.log('Testing fb download with cookies...');
    const result = await youtubedl(url, {
      maxFilesize: '25m',
      output: 'test-fb-cookies.%(ext)s',
      cookiesFromBrowser: 'edge'
    });
    console.log('FB Success');
  } catch (err) {
    console.log('FB Failed:', err.message);
  }
}

test();
