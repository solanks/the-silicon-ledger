import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { TOP_CATEGORY_GROUPS, slugifyTag } from '../config/taxonomy';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.origin ?? 'https://siliconledger.io';
  const articles = await getCollection('articles');

  const uniqueTagSlugs = Array.from(
    new Set(articles.flatMap((a) => a.data.tags.map(slugifyTag)))
  );

  const urls = [
    `<url><loc>${siteUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${siteUrl}/tags/</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
    `<url><loc>${siteUrl}/about/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    `<url><loc>${siteUrl}/privacy/</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
    `<url><loc>${siteUrl}/contact/</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
    ...TOP_CATEGORY_GROUPS.map(
      (g) =>
        `<url><loc>${siteUrl}/category/${g.slug}/</loc><changefreq>daily</changefreq><priority>0.85</priority></url>`
    ),
    ...uniqueTagSlugs.map(
      (tagSlug) =>
        `<url><loc>${siteUrl}/tags/${tagSlug}/</loc><changefreq>daily</changefreq><priority>0.75</priority></url>`
    ),
    ...articles.map(
      (article) =>
        `<url><loc>${siteUrl}/articles/${article.slug}/</loc><lastmod>${(article.data.updatedDate ?? article.data.pubDate).toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`
    )
  ].join('\n  ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
