import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.resolve('data/seen.json');

export async function readSeen() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, '[]', 'utf8');
      return [];
    }
    throw e;
  }
}

export async function writeSeen(list) {
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}
