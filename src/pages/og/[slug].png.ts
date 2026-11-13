import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { buildHighContrastOgSvg } from '../../utils/og-template';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articles');

  const articlePaths = articles.map((article) => ({
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

  return [
    ...articlePaths,
    {
      params: { slug: 'default' },
      props: {
        title: 'TechPulse Labs: Deep-Dive Silicon & Hardware Benchmarks',
        subtitle: 'Independent Telemetry, Spec Matrices & Architecture Reviews',
        category: 'Hardware Lab',
        authorName: 'TechPulse Editorial Team',
        authorRole: 'Hardware Testing Lab',
        pubDate: '2026-11-13',
        score: 9.5,
        award: "Editor's Choice"
      }
    }
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const svg = buildHighContrastOgSvg({
    title: props.title,
    subtitle: props.subtitle,
    category: props.category,
    authorName: props.authorName,
    authorRole: props.authorRole,
    pubDate: props.pubDate,
    score: props.score,
    award: props.award
  });

  try {
    const { Resvg } = await import('@resvg/resvg-js');
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200
      }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    // Graceful fallback if @resvg/resvg-js binary isn't available in the environment
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }
};
