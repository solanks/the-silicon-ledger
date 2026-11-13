import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const siteUrl = context.site?.origin ?? 'https://techpulse.example.com';

  return rss({
    title: 'TechPulse Labs — Hardware & Silicon Benchmarks',
    description:
      'Independent silicon telemetry, NotebookCheck-style spec comparisons, and Google Discover optimized hardware reviews.',
    site: siteUrl,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.pubDate,
      description: article.data.description,
      link: `/articles/${article.slug}/`,
      categories: [article.data.category, ...article.data.tags],
      customData: `<enclosure url="${siteUrl}${article.data.heroImage.src}" type="image/svg+xml" />`
    }))
  });
}
