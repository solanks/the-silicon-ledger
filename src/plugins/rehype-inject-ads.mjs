/**
 * Rehype plugin that supports BOTH:
 * 1. Explicit `<!-- AD_SLOT -->` comment markers placed by the editorial agent
 * 2. Automatic injection after every 3rd top-level paragraph (<p>) when explicit markers are absent.
 */
export function rehypeInjectAds(options = { interval: 3 }) {
  const interval = options.interval ?? 3;

  return function transformer(tree) {
    if (!tree || !Array.isArray(tree.children)) return;

    const hasExplicitMarkers = tree.children.some(
      (node) =>
        (node.type === 'comment' && node.value?.trim() === 'AD_SLOT') ||
        (node.type === 'raw' && node.value?.includes('AD_SLOT'))
    );

    let paragraphCount = 0;
    let adIndex = 0;
    const newChildren = [];

    for (const node of tree.children) {
      if (
        (node.type === 'comment' && node.value?.trim() === 'AD_SLOT') ||
        (node.type === 'raw' && node.value?.includes('<!-- AD_SLOT -->'))
      ) {
        adIndex += 1;
        newChildren.push(createInContentAdNode(adIndex, paragraphCount));
        continue;
      }

      newChildren.push(node);

      if (node.type === 'element' && node.tagName === 'p') {
        paragraphCount += 1;

        if (!hasExplicitMarkers && paragraphCount % interval === 0) {
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
        'my-8',
        'w-full',
        'border',
        'border-stone-400',
        'bg-[#EFECE4]',
        'p-3.5',
        'ad-slot-wrapper'
      ],
      'data-ad-slot': slotId,
      'data-ad-placement': 'in-content',
      'data-after-paragraph': String(afterParagraph),
      'aria-label': `Advertisement slot ${adIndex}`
    },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: {
          className: [
            'mb-2',
            'flex',
            'flex-wrap',
            'items-center',
            'justify-between',
            'border-b',
            'border-stone-300',
            'pb-1.5',
            'font-mono',
            'text-[10px]',
            'font-bold',
            'uppercase',
            'tracking-widest',
            'text-stone-600'
          ]
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: [
              {
                type: 'text',
                value: `Advertisement · In-Article Unit #${adIndex} (After ¶${afterParagraph})`
              }
            ]
          },
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['flex', 'items-center', 'gap-2']
            },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: {
                  className: [
                    'ad-refresh-badge',
                    'border',
                    'border-stone-400',
                    'bg-[#F7F4EE]',
                    'px-2',
                    'py-0.5',
                    'font-mono',
                    'text-[10px]',
                    'text-stone-700'
                  ]
                },
                children: [{ type: 'text', value: '↻ Refresh #0 (30s)' }]
              },
              {
                type: 'element',
                tagName: 'span',
                properties: {
                  className: [
                    'ad-viewability-badge',
                    'border',
                    'border-amber-700',
                    'bg-amber-50',
                    'px-2',
                    'py-0.5',
                    'font-mono',
                    'text-[10px]',
                    'text-amber-900'
                  ],
                  'data-viewability-status': 'pending'
                },
                children: [{ type: 'text', value: 'IAB: Pending…' }]
              }
            ]
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
            'min-h-[250px]',
            'w-full',
            'flex-col',
            'items-center',
            'justify-center',
            'border',
            'border-dashed',
            'border-stone-400',
            'bg-[#F7F4EE]',
            'p-6',
            'text-center'
          ]
        },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: [
                'mb-2',
                'border',
                'border-[#141413]',
                'bg-[#EFECE4]',
                'px-3',
                'py-1',
                'font-mono',
                'text-xs',
                'font-bold',
                'text-[#141413]'
              ]
            },
            children: [
              {
                type: 'text',
                value: `GAM / AdSense Slot (${slotId}) · 300×250 / 336×280 (30s Refresh)`
              }
            ]
          },
          {
            type: 'element',
            tagName: 'p',
            properties: {
              className: ['max-w-md', 'text-xs', 'text-stone-600']
            },
            children: [
              {
                type: 'text',
                value:
                  'CLS-reserved container (min-h-[250px]) injected after every 3rd paragraph.'
              }
            ]
          },
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: [
                'mt-2.5',
                'flex',
                'items-center',
                'gap-3',
                'border',
                'border-stone-300',
                'bg-white',
                'px-3',
                'py-1',
                'font-mono',
                'text-[11px]',
                'text-stone-700'
              ]
            },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: {},
                children: [
                  { type: 'text', value: 'Dwell: ' },
                  {
                    type: 'element',
                    tagName: 'strong',
                    properties: { className: ['ad-dwell-timer', 'text-emerald-800'] },
                    children: [{ type: 'text', value: '0.0s' }]
                  }
                ]
              },
              {
                type: 'element',
                tagName: 'span',
                properties: {},
                children: [
                  { type: 'text', value: 'Next Refresh: ' },
                  {
                    type: 'element',
                    tagName: 'strong',
                    properties: { className: ['ad-next-refresh', 'text-[#D9381E]'] },
                    children: [{ type: 'text', value: '30.0s' }]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}
