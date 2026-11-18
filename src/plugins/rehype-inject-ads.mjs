/**
 * Rehype plugin that injects a subtle, low-profile native sponsor slot
 * after every Nth top-level paragraph (<p>).
 */
export function rehypeInjectAds(options = { interval: 5 }) {
  const interval = options.interval ?? 5;

  return function transformer(tree) {
    if (!tree || !Array.isArray(tree.children)) return;

    let paragraphCount = 0;
    let adIndex = 0;
    const newChildren = [];

    for (const node of tree.children) {
      newChildren.push(node);

      if (node.type === 'element' && node.tagName === 'p') {
        paragraphCount += 1;

        if (paragraphCount % interval === 0) {
          adIndex += 1;
          newChildren.push(createInContentAdNode(adIndex, paragraphCount));
        }
      }
    }

    tree.children = newChildren;
  };
}

function createInContentAdNode(adIndex, afterParagraph) {
  const slotId = `ad-in-content-${adIndex}`;

  return {
    type: 'element',
    tagName: 'aside',
    properties: {
      className: [
        'not-prose',
        'my-6',
        'w-full',
        'rounded-xl',
        'border',
        'border-slate-200/80',
        'bg-slate-50/60',
        'px-3.5',
        'py-2.5',
        'ad-slot-wrapper'
      ],
      'data-ad-slot': slotId,
      'data-ad-placement': 'in-content',
      'data-after-paragraph': String(afterParagraph),
      'aria-label': `Sponsored slot ${adIndex}`
    },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: {
          className: [
            'mb-1.5',
            'flex',
            'items-center',
            'justify-between',
            'font-mono',
            'text-[10px]',
            'uppercase',
            'tracking-wider',
            'text-slate-400'
          ]
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: [{ type: 'text', value: 'Sponsored' }]
          },
          {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: [{ type: 'text', value: 'Partner Placement' }]
          }
        ]
      },
      {
        type: 'element',
        tagName: 'div',
        properties: {
          className: [
            'ad-unit-box',
            'relative',
            'flex',
            'min-h-[90px]',
            'w-full',
            'items-center',
            'justify-center',
            'overflow-hidden',
            'rounded-lg',
            'bg-white/80'
          ]
        },
        children: [
          {
            type: 'element',
            tagName: 'ins',
            properties: {
              className: ['adsbygoogle', 'block', 'w-full'],
              style: 'display:block',
              'data-ad-client': 'ca-pub-6428626874238056',
              'data-ad-format': 'auto',
              'data-full-width-responsive': 'true'
            },
            children: []
          }
        ]
      }
    ]
  };
}
