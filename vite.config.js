import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { Marked } from 'marked';

const markdown = new Marked({
  renderer: {
    // Внешние ссылки открываем в новой вкладке, внутренние и mailto — как есть.
    link({ href, tokens }) {
      if (!/^https?:/.test(href)) {
        return false;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;
    },
  },
});

// Всё в квадратных скобках, кроме ссылок вида [текст](адрес), — незаполненное поле шаблона.
const findUnfilled = (source) =>
  source.replace(/\[[^\]]*\]\([^)]*\)/g, '').match(/\[[^\]]+\]/g) || [];

// .md превращается в HTML при сборке: в бандл попадает готовая строка, а не парсер.
const markdownPages = () => ({
  name: 'markdown-pages',
  transform(source, id) {
    if (!id.endsWith('.md')) {
      return null;
    }
    const unfilled = findUnfilled(source);
    if (unfilled.length > 0) {
      this.warn(`незаполненных полей: ${unfilled.length} — ${[...new Set(unfilled)].join(', ')}`);
    }
    const html = markdown
      .parse(source)
      .replaceAll('<table>', '<div class="table-wrap"><table>')
      .replaceAll('</table>', '</table></div>');
    return { code: `export default ${JSON.stringify(html)};`, map: null };
  },
});

const verificationFileName = (code) => `tiktok${code}.txt`;

const verificationFileBody = (code) => `tiktok-developers-site-verification=${code}\n`;

const tiktokSiteVerification = (code) => ({
  name: 'tiktok-site-verification',
  configureServer(server) {
    if (!code) {
      return;
    }
    const path = `/${verificationFileName(code)}`;
    server.middlewares.use((req, res, next) => {
      if (req.url !== path) {
        next();
        return;
      }
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(verificationFileBody(code));
    });
  },
  generateBundle() {
    if (!code) {
      return;
    }
    this.emitFile({
      type: 'asset',
      fileName: verificationFileName(code),
      source: verificationFileBody(code),
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tiktokCode = process.env.TIKTOK_SITE_VERIFICATION || env.TIKTOK_SITE_VERIFICATION || '';

  return {
    plugins: [react(), markdownPages(), tiktokSiteVerification(tiktokCode)],
    server: {
      // 0.0.0.0 — чтобы дев-сервер был виден из докера и с телефона в той же сети
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
