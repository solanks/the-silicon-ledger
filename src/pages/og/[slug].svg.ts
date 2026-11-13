import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { buildHighContrastOgSvg } from '../../utils/og-template';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articles');

  return articles.map((article) => ({
    params: { slug: article.slug },
    props: {
      title: article.data.title,
      subtitle: article.data.subtitle,
      category: article.data.category,
      authorName: article.data.author.name,
      authorRole: article.data.author.role,
      pubDate: article.data.pubDate.toISOString().split('T')[0],
      score: article.data.verdict.score,
      award: article.data.verdict.award
    }
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const svg = buildHighContrastOgSvg({
    title: props.title as string,
    subtitle: props.subtitle as string | undefined,
    category: props.category as string,
    authorName: props.authorName as string,
    authorRole: props.authorRole as string,
    pubDate: props.pubDate as string,
    score: props.score as number,
    award: props.award as string | undefined
  });

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};
