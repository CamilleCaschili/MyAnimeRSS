import axios from "axios";
import fs from "fs";
import { load } from "cheerio";
import dotenv from "dotenv";
dotenv.config();

const BASE = process.env.BASE_URL || "";

export default async function scrapeEpisodes() {
  if (!URL) throw new Error("CRAWL_URL non défini dans .env");

  let seen = [];
  if (fs.existsSync("./data/seen.json")) {
    seen = JSON.parse(fs.readFileSync("./data/seen.json", "utf8"));
  }

  let urls = [];
  if (fs.existsSync("./data/urls.json")) {
    urls = JSON.parse(fs.readFileSync("./data/urls.json", "utf8"));
  }

  const allEpisodes = [];
  const seenIds = new Set(seen);

  for (let i = 0; i < urls.length; i++) {
    console.log("Scraping:", urls[i]);
    const { data } = await axios.get(urls[i]);

    const $ = load(data);
    const episodes = [];

    $(".wp-manga-chapter").each((i, el) => {
      const $el = $(el);
      let title = $el.find(".episode-title, .title, h3").first().text().trim();
      if (!title) title = $el.find("a").first().text().trim();

      let href = $el.find("a").first().attr("href") || "";
      if (href && !href.startsWith("http")) href = BASE + href;

      const id = href || title + "-" + i;
      const pubDate = $el.find(".air-date, .date").text().trim() || null;
      const description = $el.find(".description, .excerpt").text().trim() || "";

      episodes.push({ id, title, link: href, pubDate, description });
    });

    if (episodes.length === 0) {
      $("a").each((i, el) => {
        const href = $(el).attr("href") || "";
        if (/episode/i.test(href)) {
          const title = $(el).text().trim() || "Episode";
          const full = href.startsWith("http") ? href : BASE + href;
          episodes.push({
            id: full,
            title,
            link: full,
            pubDate: null,
            description: "",
          });
        }
      });
    }

    for (const e of episodes) {
      if (!e.id) continue;
      if (!seenIds.has(e.id)) {
        allEpisodes.push(e);
        seenIds.add(e.id);
      }
    }
  }

  fs.writeFileSync("./data/seen.json", JSON.stringify([...seenIds], null, 2));
  return allEpisodes;
}
