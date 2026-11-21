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

  const fallbackDeals = [
    {
      badge: 'Lab Tested · Top GaN Pick',
      title: 'Ugreen Nexode 100W 4-Port USB-C GaN Fast Charger',
      detail: 'Sustains 99.8W continuous output at 57.9°C without thermal reset disconnects.',
      href: 'https://www.amazon.com/s?k=Ugreen+Nexode+100W+USB+C+Charger&tag=siliconledger-20'
    },
    {
      badge: 'Certified 240W + 40Gbps',
      title: 'Anker Prime USB4 240W Braided USB-C Cable (3.3ft)',
      detail: 'Verified Cypress E-Marker chip with full 48V/5A EPR power and 40Gbps PCIe tunneling.',
      href: 'https://www.amazon.com/s?k=Anker+Prime+USB4+240W+Cable&tag=siliconledger-20'
    },
    {
      badge: 'Qi2 Thermal Winner',
      title: 'Anker MagGo Power Bank (10K, Slim Qi2 15W)',
      detail: 'Coolest magnetic wireless charging pack in our FLIR thermal chamber test.',
      href: 'https://www.amazon.com/s?k=Anker+MagGo+Power+Bank+10K+Qi2&tag=siliconledger-20'
    }
  ];

  const deal = fallbackDeals[(adIndex - 1) % fallbackDeals.length];

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
            'flex-col',
            'items-center',
            'justify-center',
            'overflow-hidden',
            'rounded-lg',
            'bg-white/90'
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
          },
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['ad-fallback-card', 'w-full', 'p-2.5']
            },
            children: [
              {
                type: 'element',
                tagName: 'a',
                properties: {
                  href: deal.href,
                  target: '_blank',
                  rel: 'nofollow sponsored noopener noreferrer',
                  className: [
                    'group',
                    'flex',
                    'flex-col',
                    'justify-between',
                    'gap-2',
                    'rounded-lg',
                    'border',
                    'border-slate-200/90',
                    'bg-slate-50/80',
                    'px-3.5',
                    'py-2.5',
                    'transition',
                    'hover:border-rose-300',
                    'hover:bg-rose-50/40',
                    'sm:flex-row',
                    'sm:items-center'
                  ]
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'div',
                    properties: {
                      className: ['min-w-0', 'flex-1']
                    },
                    children: [
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
                                'rounded',
                                'bg-rose-100',
                                'px-1.5',
                                'py-0.5',
                                'font-mono',
                                'text-[9px]',
                                'font-bold',
                                'uppercase',
                                'text-rose-700'
                              ]
                            },
                            children: [{ type: 'text', value: deal.badge }]
                          },
                          {
                            type: 'element',
                            tagName: 'span',
                            properties: {
                              className: [
                                'truncate',
                                'text-xs',
                                'font-bold',
                                'text-slate-900',
                                'group-hover:text-rose-600'
                              ]
                            },
                            children: [{ type: 'text', value: deal.title }]
                          }
                        ]
                      },
                      {
                        type: 'element',
                        tagName: 'p',
                        properties: {
                          className: [
                            'mt-0.5',
                            'text-[11px]',
                            'text-slate-500',
                            'line-clamp-1'
                          ]
                        },
                        children: [{ type: 'text', value: deal.detail }]
                      }
                    ]
                  },
                  {
                    type: 'element',
                    tagName: 'span',
                    properties: {
                      className: [
                        'shrink-0',
                        'rounded-lg',
                        'bg-slate-900',
                        'px-3',
                        'py-1.5',
                        'font-mono',
                        'text-[10px]',
                        'font-bold',
                        'uppercase',
                        'text-white',
                        'transition',
                        'group-hover:bg-rose-600'
                      ]
                    },
                    children: [{ type: 'text', value: 'Check Amazon →' }]
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
