import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { rehypeInjectAds } from './src/plugins/rehype-inject-ads.mjs';

export default defineConfig({
  site: 'https://the-silicon-ledger.netlify.app',
  output: 'hybrid',
  markdown: {
    rehypePlugins: [[rehypeInjectAds, { interval: 3 }]]
  },
  integrations: [
    tailwind({
      applyBaseStyles: true
    }),
    mdx({
      rehypePlugins: [[rehypeInjectAds, { interval: 3 }]]
    }),
    sitemap()
  ]
});
