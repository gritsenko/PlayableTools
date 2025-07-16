import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export default function rewriteBaseHrefPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'rewrite-base-href',
    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build?.outDir || 'dist';
    },
    closeBundle() {
      const indexPath = path.resolve(process.cwd(), outDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf8');
        html = html.replace('<base href="./">', '<base href="/PlayableTools/">');
        fs.writeFileSync(indexPath, html, 'utf8');
      }
    },
  };
}
