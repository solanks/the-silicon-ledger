export interface OgCardPayload {
  title: string;
  subtitle?: string;
  category: string;
  authorName: string;
  authorRole: string;
  pubDate: string;
  score?: number;
  award?: string;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapHeadline(text: string, maxCharsPerLine = 32, maxLines = 3): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }

  if (current) {
    lines.push(current);
  }
  return lines.slice(0, maxLines);
}

/**
 * Generates a 1200x630 editorial broadsheet / lab-report OpenGraph card
 * using warm newsprint (#F7F4EE), carbon ink (#141413), and Signal Vermilion (#D9381E).
 */
export function buildHighContrastOgSvg(payload: OgCardPayload): string {
  const lines = wrapHeadline(payload.title, 30, 3);
  const score = payload.score ?? 9.0;
  const scoreBg =
    score >= 8.5 ? '#15803D' : score >= 7.0 ? '#B45309' : '#D9381E';

  const headlineTspans = lines
    .map(
      (line, index) =>
        `<tspan x="72" dy="${index === 0 ? 0 : 70}">${escapeXml(line)}</tspan>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Warm Editorial Newsprint Background -->
  <rect width="1200" height="630" fill="#F7F4EE" />

  <!-- Top Signal Vermilion Bar -->
  <rect x="0" y="0" width="1200" height="16" fill="#D9381E" />

  <!-- Heavy Carbon Ink Editorial Frame + Offset Hard Shadow -->
  <rect x="46" y="46" width="1120" height="550" fill="#141413" />
  <rect x="38" y="38" width="1120" height="550" fill="#FCFBF8" stroke="#141413" stroke-width="4" />

  <!-- Category Stamp -->
  <rect x="72" y="74" width="250" height="40" fill="#D9381E" />
  <text x="197" y="100" text-anchor="middle" fill="#ffffff" font-family="ui-monospace, monospace" font-size="16" font-weight="800" letter-spacing="1.5">
    ${escapeXml(payload.category.toUpperCase())}
  </text>

  <!-- Publication Masthead -->
  <text x="344" y="100" fill="#141413" font-family="ui-monospace, monospace" font-size="18" font-weight="700" letter-spacing="1.5">
    THE SILICON LEDGER // HARDWARE TESTING DESK
  </text>

  <!-- Verdict Score Stamp (Right Aligned) -->
  <g transform="translate(944, 68)">
    <rect x="6" y="6" width="176" height="138" fill="#141413" />
    <rect x="0" y="0" width="176" height="138" fill="${scoreBg}" stroke="#141413" stroke-width="3" />
    <text x="88" y="68" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="56" font-weight="900">
      ${score.toFixed(1)}
    </text>
    <text x="88" y="96" text-anchor="middle" fill="#F7F4EE" font-family="ui-monospace, monospace" font-size="14" font-weight="700" letter-spacing="1">
      LAB SCORE / 10
    </text>
    <text x="88" y="120" text-anchor="middle" fill="#ffffff" font-family="ui-monospace, monospace" font-size="12" font-weight="700">
      ${escapeXml((payload.award ?? 'VERIFIED').toUpperCase().slice(0, 18))}
    </text>
  </g>

  <!-- High-Contrast Carbon Ink Serif Headline -->
  <text x="72" y="220" fill="#141413" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="900" letter-spacing="-0.5">
    ${headlineTspans}
  </text>

  <!-- Bottom Colophon Rule -->
  <line x1="72" y1="486" x2="1120" y2="486" stroke="#141413" stroke-width="3" />

  <text x="72" y="532" fill="#141413" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800">
    By ${escapeXml(payload.authorName)}
  </text>
  <text x="72" y="560" fill="#57534E" font-family="ui-monospace, monospace" font-size="16" font-weight="600">
    ${escapeXml(payload.authorRole)} · Filed ${escapeXml(payload.pubDate)}
  </text>

  <!-- Right Stamp -->
  <rect x="850" y="512" width="270" height="44" fill="#141413" />
  <text x="985" y="540" text-anchor="middle" fill="#F7F4EE" font-family="ui-monospace, monospace" font-size="15" font-weight="700">
    INDEPENDENT TEARDOWN
  </text>
</svg>`;
}
