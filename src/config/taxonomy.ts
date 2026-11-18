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
    label: 'Mac, iPad & PC',
    description: 'MacBook Pro & Air, iPad Pro & iPad Air, Gaming GPUs, CPUs & OLED Monitors.',
    categoriesMatched: ['Laptops & GPUs', 'Silicon & SoCs', 'Displays & Audio'],
    tagsMatched: [
      'Mac',
      'iPad',
      'M5 MacBook Pro',
      'Apple Silicon',
      'GPU Benchmarks',
      '8GB VRAM Trap',
      'RTX 5090 Laptop',
      'OLED Monitors',
      'PC Gaming'
    ],
    subItems: [
      { label: 'Mac & MacBook Pro', href: '/tags/mac', badge: 'Hot' },
      { label: 'iPad Pro & iPad Air', href: '/tags/ipad', badge: 'New' },
      { label: 'PC GPUs & VRAM Benchmarks', href: '/tags/gpu-benchmarks' },
      { label: 'OLED & Mac External Monitors', href: '/tags/oled-monitors' },
      { label: 'All Mac, iPad & PC Reviews', href: '/category/laptops-pc' }
    ]
  },
  {
    slug: 'phones-mobile',
    label: 'iPhone & Android',
    description: 'iPhone 16/17 Pro, Google Pixel, Android Flagships & 5G Battery Tests.',
    categoriesMatched: ['Phones & Mobile', 'Smartphones', 'Silicon & SoCs'],
    tagsMatched: [
      'iPhone',
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
      { label: 'iPhone & Apple A-Series', href: '/tags/iphone', badge: 'Popular' },
      { label: 'Google Pixel & Android', href: '/tags/google-pixel', badge: 'Tested' },
      { label: 'iPad Cellular & Tablet Tech', href: '/tags/ipad' },
      { label: '5G Modem & Battery Drain Lab', href: '/tags/5g-battery-drain' },
      { label: 'All iPhone & Android Reports', href: '/category/phones-mobile' }
    ]
  },
  {
    slug: 'chargers-power',
    label: 'Chargers & Power',
    description: 'Anker vs. Ugreen GaN Chargers for Mac, iPhone, iPad & Pixel.',
    categoriesMatched: ['Chargers & Power'],
    tagsMatched: [
      'Anker',
      'Ugreen',
      'GaN Chargers',
      'USB-C Power',
      'Power Banks'
    ],
    subItems: [
      { label: 'Anker Chargers & Power Banks', href: '/tags/anker', badge: 'Top Pick' },
      { label: 'Ugreen GaN Bricks & Docks', href: '/tags/ugreen' },
      { label: 'Mac, iPad & iPhone Fast Charging', href: '/tags/gan-chargers' },
      { label: 'All Chargers & Power Gear', href: '/category/chargers-power' }
    ]
  },
  {
    slug: 'audio-earbuds',
    label: 'Audio & Earbuds',
    description: 'AirPods & Wireless ANC Earbuds, Soundcore, Sony, Bose & Battery Tests.',
    categoriesMatched: ['Audio & Earbuds', 'Displays & Audio'],
    tagsMatched: [
      'Earbuds',
      'ANC Audio',
      'Soundcore',
      'Bluetooth Codecs'
    ],
    subItems: [
      { label: 'Wireless Earbuds & AirPods ANC', href: '/tags/earbuds', badge: 'Best Value' },
      { label: 'Soundcore & $79 Challengers', href: '/tags/soundcore' },
      { label: 'Earbud Battery Degradation Lab', href: '/tags/anc-audio' },
      { label: 'All Audio & Earbuds', href: '/category/audio-earbuds' }
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
      { label: 'Cloud & Internet Outages', href: '/tags/cloud-outages', badge: 'Live' },
      { label: 'AI & Media Traffic Heist', href: '/articles/ai-search-traffic-heist-news-media-collapse' },
      { label: 'Buyer Advocacy & Hardware Traps', href: '/tags/buyer-advocacy' },
      { label: 'All Investigations', href: '/category/tech-investigations' }
    ]
  }
];
