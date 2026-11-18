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
                value: 'Advertisement'
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
            'border-stone-300',
            'bg-[#F7F4EE]',
            'p-6',
            'text-center'
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
