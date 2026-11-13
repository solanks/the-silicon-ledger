import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}'
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Public Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
         display: ['Newsreader', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        paper: {
          DEFAULT: '#F7F4EE',
          warm: '#EFECE4',
          card: '#FCFBF8'
        },
        ink: {
          DEFAULT: '#141413',
          muted: '#57534E',
          faint: '#A8A29E'
        },
        vermilion: {
          DEFAULT: '#D9381E',
          dark: '#B02A14',
          light: '#FDECE9'
        }
      }
    }
  },
  plugins: [typography]
};
