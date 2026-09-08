import { cleanupMarketplaceDummyData } from '../src/scripts/cleanupMarketplaceDummyData.js';
import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const hasConfirm = process.argv.includes('--confirm') || process.argv.includes('--force');
  cleanupMarketplaceDummyData(hasConfirm);
}

export { cleanupMarketplaceDummyData };
