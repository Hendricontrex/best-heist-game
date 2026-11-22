// main.ts — hands in The Meridian Gallery (Node 22, stdlib only).
// It copies this repository's game/ and screenshots/ beside it into
// the output directory and writes dossier.json there, built by the
// vendored make.fun library from exactly those files. Outside the
// grader, MAKEFUN_OUTPUT_DIR stands in for /output, so a local run
// of `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` writes
// out/ the same bytes the grader would receive. The program runs
// twice on the platform and both runs must write identical bytes:
// it only copies and writes, so they do.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), {
    recursive: true,
  });
}

writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
