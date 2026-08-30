import { marked } from 'marked';

marked.use({
  gfm: true,
  renderer: {
    html() {
      return '';
    },
  },
});

export function markdownToSafeHtml(markdown: string): string {
  const html = marked.parse(markdown, { async: false });
  return scrubHtml(html);
}

function scrubHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\shref=(["'])\s*(javascript|data|vbscript):[^"']*\1/gi, ' href="#"');
}
