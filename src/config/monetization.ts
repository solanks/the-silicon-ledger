/**
 * Central Monetization & Affiliate Configuration for The Silicon Ledger.
 *
 * HOW TO LINK YOUR AMAZON ASSOCIATES (PARTNERS) ACCOUNT:
 * 1. Log in to https://affiliate-program.amazon.com/
 * 2. Look at the top-right corner for "Store ID: xxxx-20"
 * 3. Replace 'siliconledger-20' below with your Store ID (or set PUBLIC_AMAZON_AFFILIATE_TAG in Netlify).
 */
export const AMAZON_AFFILIATE_TAG =
  import.meta.env.PUBLIC_AMAZON_AFFILIATE_TAG || 'siliconledger-20';

export const ADSENSE_CLIENT_ID =
  import.meta.env.PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-6428626874238056';

/**
 * Automatically converts any product name or Amazon URL into a tagged
 * Amazon Associates affiliate URL (`?tag=yourtag-20`) so every click
 * earns 3%–4% hardware commission.
 */
export function buildAmazonAffiliateUrl(
  productNameOrUrl: string,
  fallbackSearchQuery?: string
): string {
  const tag = AMAZON_AFFILIATE_TAG;

  if (productNameOrUrl && productNameOrUrl.startsWith('http')) {
    try {
      const url = new URL(productNameOrUrl);
      if (url.hostname.includes('amazon.')) {
        url.searchParams.set('tag', tag);
        return url.toString();
      }
    } catch {
      // Fall through to search URL
    }
  }

  const query = encodeURIComponent(
    (fallbackSearchQuery || productNameOrUrl || 'Laptop GPU Hardware').replace(
      /\([^)]*\)/g,
      ''
    ).trim()
  );
  return `https://www.amazon.com/s?k=${query}&tag=${tag}`;
}
