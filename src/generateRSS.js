import fs from 'fs/promises';
import RSS from 'rss';
import dotenv from 'dotenv';
dotenv.config();

const OUTPUT = process.env.RSS_OUTPUT || 'public/rss.xml';
const SITE_TITLE = process.env.SITE_TITLE || 'Mon RSS';
const SITE_LINK = process.env.SITE_LINK || 'https://example.org';

export async function generateRss(items = []) {
  const feed = new RSS({
    title: SITE_TITLE,
    site_url: SITE_LINK,
    feed_url: SITE_LINK + '/rss.xml',
    pubDate: new Date()
  });

  for (const it of items) {
    feed.item({
      title: it.title,
      description: it.description || '',
      url: it.link,
      guid: it.id,
      date: it.pubDate || new Date()
    });
  }

  const xml = feed.xml({ indent: true });

  await fs.mkdir('public', { recursive: true });
  await fs.writeFile(OUTPUT, xml, 'utf8');
  console.log(`RSS généré (${items.length} items) -> ${OUTPUT}`);
}
