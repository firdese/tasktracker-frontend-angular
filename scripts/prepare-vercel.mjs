import { copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const browserDistDir = resolve('dist', 'angular-workspace', 'browser');
const csrIndexPath = resolve(browserDistDir, 'index.csr.html');
const indexPath = resolve(browserDistDir, 'index.html');

async function main() {
  await access(csrIndexPath, constants.F_OK);
  await copyFile(csrIndexPath, indexPath);
  console.log(`Prepared Vercel entrypoint at ${indexPath}`);
}

main().catch((error) => {
  console.error('Failed to prepare Vercel browser output.', error);
  process.exitCode = 1;
});
