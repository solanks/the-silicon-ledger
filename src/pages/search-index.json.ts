import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slugifyTag } from '../config/taxonomy';

export const prerender = true;

export const GET: APIRoute = async () => {
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const index = articles.map((article) => ({
    slug: article.slug,
    url: `/articles/${article.slug}/`,
    title: article.data.title,
    subtitle: article.data.subtitle ?? '',
    description: article.data.description,
    category: article.data.category,
    tags: article.data.tags,
    tagSlugs: article.data.tags.map(slugifyTag),
    score: article.data.verdict.score,
    award: article.data.verdict.award ?? '',
    price: article.data.verdict.price ?? '',
    heroImage: article.data.heroImage.src,
    pubDate: article.data.pubDate.toISOString().split('T')[0]
  }));

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
