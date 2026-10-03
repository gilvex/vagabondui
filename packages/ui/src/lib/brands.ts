export const brands = [
  {
    id: 'vagabond',
    name: 'Vagabond',
    subtitle: 'The original baseline',
    description: 'Neutral zinc, Inter, and a monochrome primary action.',
    source: 'Original component system',
    sourceUrl: '#components',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
    darkSwatch: '#f4f4f5',
    lightSwatch: '#18181b',
  },
  {
    id: 'gilvex',
    name: 'Gilvex',
    subtitle: 'Personal / engineering',
    description: 'Olive surfaces, lime emphasis, and a more editorial type hierarchy.',
    source: 'From PersonalHeroSite',
    sourceUrl: 'https://www.gilvex.link',
    headingFont: 'Manrope',
    bodyFont: 'DM Sans',
    monoFont: 'IBM Plex Mono',
    darkSwatch: '#d6ef9c',
    lightSwatch: '#426126',
  },
  {
    id: 'gilgil',
    name: 'GilGil',
    subtitle: 'Studio / client-facing',
    description: 'Obsidian, warm gold, and precise geometry for professional workflows.',
    source: 'From GilGil BrandSite',
    sourceUrl: 'https://gilgil.co',
    headingFont: 'Manrope',
    bodyFont: 'DM Sans',
    monoFont: 'IBM Plex Mono',
    darkSwatch: '#e7c17c',
    lightSwatch: '#896128',
  },
] as const

export type BrandId = (typeof brands)[number]['id']
export type ColorMode = 'light' | 'dark'
export function isBrand(value: unknown): value is BrandId {
  return brands.some((brand) => brand.id === value)
}
export function isColorMode(value: unknown): value is ColorMode {
  return value === 'light' || value === 'dark'
}
