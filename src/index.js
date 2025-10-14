import scrapeEpisodes from './scrape.js';
import fs from 'fs';

async function main() {
  const episodes = await scrapeEpisodes();

  const rssItems = episodes.map(ep => `
    <item>
      <title>${ep.title}</title>
      <link>${ep.link}</link>
    </item>`).join('');

  const rss = `<?xml version="1.0"?>
<rss version="2.0">
<channel>
  <title>VoirAnime RSS</title>
  <link>${process.env.CRAWL_URL}</link>
  <description>Flux auto-généré depuis VoirAnime</description>
  ${rssItems}
</channel>
</rss>`;

  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/rss.xml', rss, 'utf8');

  console.log(`✅ RSS généré avec ${episodes.length} épisodes`);
}

main().catch(console.error);
