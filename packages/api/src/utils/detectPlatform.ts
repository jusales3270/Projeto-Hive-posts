export function detectPlatform(url: string): string {
  const patterns: Record<string, RegExp> = {
    youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/,
    instagram: /instagram\.com\/(p|reel|tv)\//,
    tiktok: /tiktok\.com\/@.+\/video\//,
    facebook: /facebook\.com\/(watch|share|.*\/videos\/)/,
    linkedin: /linkedin\.com\/(posts|feed|video)\//,
  };

  for (const ObjectEntry of Object.entries(patterns)) {
    const platform = ObjectEntry[0];
    const pattern = ObjectEntry[1];
    if (pattern.test(url)) return platform;
  }

  return 'unknown';
}
