export function unwrapXmlCdata(input: string): string {
  return input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1');
}

export function stripHtml(input: string | null | undefined): string {
  if (!input) return '';
  let s = unwrapXmlCdata(input);
  s = decodeEntities(s);
  s = s.replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  s = s.replace(/[ \t\r\f\v]+/g, ' ');
  s = s.replace(/\n\s*\n+/g, '\n\n');
  return s.trim();
}

function innerText(input: string): string {
  return stripHtml(input).replace(/\s+/g, ' ').trim();
}

/** RSS/ATS HTML to markdown for the Details page. */
export function htmlToMarkdown(input: string | null | undefined): string {
  if (!input) return '';
  let s = unwrapXmlCdata(input);
  s = s.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style\b[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<img\b[^>]*>/gi, '');
  s = decodeEntities(s);

  s = s.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, inner: string) => {
    const label = innerText(inner);
    return label ? `[${label}](${href})` : href;
  });

  s = s.replace(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, level: string, inner: string) => {
    const text = innerText(inner);
    return text ? `\n\n${'#'.repeat(Number(level))} ${text}\n\n` : '\n\n';
  });

  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _tag: string, inner: string) => {
    const text = innerText(inner);
    return text ? `**${text}**` : '';
  });
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _tag: string, inner: string) => {
    const text = innerText(inner);
    return text ? `*${text}*` : '';
  });

  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner: string) => {
    const text = innerText(inner);
    return text ? `\n- ${text}` : '';
  });
  s = s.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n');

  s = s.replace(/<(br|\/p|\/div)\s*\/?>/gi, '\n\n');
  s = s.replace(/<(p|div)\b[^>]*>/gi, '\n\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  s = s.replace(/[ \t\r\f\v]+/g, ' ');
  s = s.replace(/ *\n */g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&apos;/gi, "'")
    .replace(/&mdash;/gi, '\u2014')
    .replace(/&ndash;/gi, '\u2013')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number.parseInt(n, 10)));
}
