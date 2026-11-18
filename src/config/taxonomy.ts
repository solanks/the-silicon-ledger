export interface NavSubItem {
  label: string;
  href: string;
  badge?: string;
}

export interface NavCategoryGroup {
  slug: string;
  label: string;
  description: string;
  categoriesMatched: string[];
  tagsMatched: string[];
  subItems: NavSubItem[];
}

export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const TOP_CATEGORY_GROUPS: NavCategoryGroup[] = [
  {
    slug: 'laptops-pc',
    label: 'Laptops & PC',
    description: 'MacBooks, Gaming Laptops, Desktop GPUs, CPUs & OLED Monitors.',
    categoriesMatched: ['Laptops & GPUs', 'Silicon & SoCs', 'Displays & Audio'],
    tagsMatched: [
      'M5 MacBook Pro',
      'Apple Silicon',
      'GPU Benchmarks',
      '8GB VRAM Trap',
      'RTX 5090 Laptop',
      'OLED Monitors',
      'PC Gaming'
    ],
    subItems: [
      { label: 'All Laptops & PC Hardware', href: '/category/laptops-pc' },
      { label: 'MacBooks & Apple Silicon', href: '/tags/apple-silicon', badge: 'Hot' },
      { label: 'GPUs & VRAM Benchmarks', href: '/tags/gpu-benchmarks' },
      { label: 'OLED & Mini-LED Monitors', href: '/tags/oled-monitors' },
      { label: 'Day-One Firmware Traps', href: '/articles/day-one-flagship-firmware-beta-test-trap' }
    ]
  },
  {
    slug: 'phones-mobile',
    label: 'Phones & Android',
    description: 'Google Pixel, Android Flagships, Snapdragon vs. A-Series & 5G Battery Tests.',
    categoriesMatched: ['Phones & Mobile', 'Smartphones', 'Silicon & SoCs'],
    tagsMatched: [
      'Google Pixel',
      'Android',
      'Tensor Chip',
      '5G Battery Drain',
      'Smartphones',
      'Snapdragon 8 Elite',
      'Apple A18 Pro',
      'Mobile Benchmarks'
    ],
    subItems: [
      { label: 'All Phones & Mobile', href: '/category/phones-mobile' },
      { label: 'Google Pixel & Android', href: '/tags/google-pixel', badge: 'New' },
      { label: '5G Modem & Battery Tests', href: '/tags/5g-battery-drain' },
      { label: 'Snapdragon vs. Apple Silicon', href: '/articles/snapdragon-8-elite-vs-a18-pro-review' }
    ]
  },
  {
    slug: 'chargers-power',
    label: 'Chargers & Power',
    description: 'Anker vs. Ugreen GaN Chargers, Power Banks, USB-C Cables & Thermal Tests.',
    categoriesMatched: ['Chargers & Power'],
    tagsMatched: [
      'Anker',
      'Ugreen',
      'GaN Chargers',
      'USB-C Power',
      'Power Banks'
    ],
    subItems: [
      { label: 'All Chargers & Power Gear', href: '/category/chargers-power' },
      { label: 'Anker Chargers & Power Banks', href: '/tags/anker', badge: 'Tested' },
      { label: 'Ugreen GaN Bricks & Docks', href: '/tags/ugreen' },
      { label: 'GaN Thermal Throttling Tests', href: '/tags/gan-chargers' }
    ]
  },
  {
    slug: 'audio-earbuds',
    label: 'Audio & Earbuds',
    description: 'Wireless ANC Earbuds, Battery Longevity, Soundcore, Sony, Bose & Codecs.',
    categoriesMatched: ['Audio & Earbuds', 'Displays & Audio'],
    tagsMatched: [
      'Earbuds',
      'ANC Audio',
      'Soundcore',
      'Bluetooth Codecs'
    ],
    subItems: [
      { label: 'All Audio & Earbuds', href: '/category/audio-earbuds' },
      { label: 'Wireless Earbuds & ANC', href: '/tags/earbuds', badge: 'Top Picks' },
      { label: 'Soundcore & Value Audio', href: '/tags/soundcore' },
      { label: 'ANC & Battery Degradation Lab', href: '/tags/anc-audio' }
    ]
  },
  {
    slug: 'tech-investigations',
    label: 'Outages & Big Tech',
    description: 'Cloud Outage Post-Mortems, Zero-Click AI Search & Buyer Advocacy.',
    categoriesMatched: ['AI Hardware'],
    tagsMatched: [
      'Cloud Outages',
      'Infrastructure',
      'Media Economics',
      'Buyer Advocacy',
      'Wallet Protector'
    ],
    subItems: [
      { label: 'All Investigations', href: '/category/tech-investigations' },
      { label: 'Cloud & Internet Outages', href: '/tags/cloud-outages', badge: 'Live' },
      { label: 'AI & Media Traffic Heist', href: '/articles/ai-search-traffic-heist-news-media-collapse' },
      { label: 'Buyer Advocacy & Traps', href: '/tags/buyer-advocacy' }
    ]
  }
];
