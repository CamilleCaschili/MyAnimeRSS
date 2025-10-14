// src/index.js
import dotenv from 'dotenv';
dotenv.config();
import cron from 'node-cron';
import scrapeEpisodes from './scrape.js';
import { readSeen, writeSeen } from './store.js';
import { generateRss } from './generateRSS.js';

const CRON = process.env.CHECK_CRON || '*/30 * * * *'; // default every 30min

async function checkOnce() {
  try {
    console.log(`[${new Date().toISOString()}] Lancement du check...`);
    const scraped = await scrapeEpisodes();
    const seen = await readSeen();

    const seenSet = new Set(seen);
    const newEpisodes = scraped.filter(e => !seenSet.has(e.id));

    if (newEpisodes.length > 0) {
      console.log('Nouveaux épisodes trouvés :', newEpisodes.map(e => e.id));
      // Les afficher en tête du RSS (on combine scraped + seen => on garde scraped comme source)
      await generateRss(scraped);

      // mettre à jour le seen (on ajoute les nouveaux IDs)
      const updated = [...seen, ...newEpisodes.map(e => e.id)];
      await writeSeen(updated);
    } else {
      // pas de nouveau, mais on peut quand même mettre à jour le RSS si besoin
      await generateRss(scraped);
      console.log('Aucun nouvel épisode.');
    }
  } catch (err) {
    console.error('Erreur lors du check:', err);
  }
}

// Si tu veux tester manuellement
if (process.env.RUN_ONCE === 'true') {
  checkOnce().then(() => process.exit(0));
} else {
  // Cron scheduler
  console.log('Scheduler démarré. Cron=', CRON);
  cron.schedule(CRON, () => {
    checkOnce();
  });

  // lance une première vérif immédiate
  checkOnce();
}
