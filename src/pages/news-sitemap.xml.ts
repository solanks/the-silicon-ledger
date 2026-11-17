import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.origin ?? 'https://siliconledger.io';
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const items = articles
    .map(
      (article) => `  <url>
    <loc>${siteUrl}/articles/${article.slug}/</loc>
    <news:news>
      <news:publication>
        <news:name>The Silicon Ledger</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.data.pubDate.toISOString()}</news:publication_date>
      <news:title>${escapeXml(article.data.title)}</news:title>
      <news:keywords>${escapeXml(article.data.tags.join(', '))}</news:keywords>
    </news:news>
    <image:image>
      <image:loc>${siteUrl}${article.data.heroImage.src}</image:loc>
      <image:title>${escapeXml(article.data.title)}</image:title>
    </image:image>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${items}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
