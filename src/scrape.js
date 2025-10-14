import axios from 'axios';
import { load } from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();

const URL = process.env.CRAWL_URL;
const BASE = process.env.BASE_URL || '';

export default async function scrapeEpisodes() {
  if (!URL) throw new Error('CRAWL_URL non défini dans .env');

  const { data } = await axios.get(URL, {
    headers: {
      'User-Agent': 'my-hero-rss-bot/1.0 (+https://github.com/yourname)'
    },
    timeout: 15000
  });

  const $ = load(data);

  const episodes = [];

  $('.wp-manga-chapter').each((i, el) => {
    const $el = $(el);
    let title = $el.find('.episode-title, .title, h3').first().text().trim();
    if (!title) title = $el.find('a').first().text().trim(); // fallback

    let href = $el.find('a').first().attr('href') || '';
    if (href && !href.startsWith('http')) href = BASE + href;

    const id = href || (title + '-' + i);

    let pubDate = $el.find('.air-date, .date').text().trim() || null;

    const description = $el.find('.description, .excerpt').text().trim() || '';

    episodes.push({
      id,
      title,
      link: href,
      pubDate,
      description
    });
  });

  if (episodes.length === 0) {
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (/episode/i.test(href)) {
        const title = $(el).text().trim() || 'Episode';
        const full = href.startsWith('http') ? href : BASE + href;
        episodes.push({
          id: full,
          title,
          link: full,
          pubDate: null,
          description: ''
        });
      }
    });
  }

  const unique = [];
  const seenIds = new Set();
  for (const e of episodes) {
    if (!e.id) continue;
    if (!seenIds.has(e.id)) {
      unique.push(e);
      seenIds.add(e.id);
    }
  }

  return unique;
}
