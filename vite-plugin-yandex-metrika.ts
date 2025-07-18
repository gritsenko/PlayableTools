import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

const METRIKA_COMMENT = '<!-- Yandex.Metrika counter -->';
const METRIKA_SNIPPET = `<!-- Yandex.Metrika counter -->\n<script type="text/javascript" >\n   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};\n   m[i].l=1*new Date();\n   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}\n   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})\n   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");\n\n   ym(103267661, "init", {\n        clickmap:true,\n        trackLinks:true,\n        accurateTrackBounce:true\n   });\n</script>\n<div><img src=\"https://mc.yandex.ru/watch/103267661\" style=\"position:absolute; left:-9999px;\" alt=\"\" /></div>\n<!-- /Yandex.Metrika counter -->`;

export default function yandexMetrikaPlugin(): Plugin {
  return {
    name: 'inject-yandex-metrika',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const outDir = 'dist';
      const indexPath = path.join(outDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        if (html.includes(METRIKA_COMMENT)) {
          html = html.replace(METRIKA_COMMENT, METRIKA_SNIPPET);
          fs.writeFileSync(indexPath, html, 'utf-8');
        }
      }
    },
  };
}
