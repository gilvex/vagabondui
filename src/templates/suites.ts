import {
  Landmark,
  Layers,
  MessageSquare,
  Package,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { TemplateId, TemplateSuite } from './catalog'

type Suite = {
  brand: string
  icon: LucideIcon
  home: TemplateId
  navigation: { id: TemplateId; label: string }[]
  showHeader: boolean
  footerBrand: string
}

export const suites: Record<TemplateSuite, Suite> = {
  banking: {
    brand: 'Meridian Bank',
    icon: Landmark,
    home: 'banking',
    showHeader: false,
    footerBrand: 'Meridian Bank',
    navigation: [],
  },
  workspace: {
    brand: 'Northstar',
    icon: Layers,
    home: 'dashboard',
    showHeader: true,
    footerBrand: 'Northstar',
    navigation: [
      { id: 'dashboard', label: 'Overview' },
      { id: 'projects', label: 'Projects' },
      { id: 'settings', label: 'Settings' },
    ],
  },
  logistics: {
    brand: 'ParcelFlow',
    icon: Package,
    home: 'sorting',
    showHeader: true,
    footerBrand: 'ParcelFlow',
    navigation: [
      { id: 'sorting', label: 'Sorting center' },
      { id: 'pickup', label: 'Pickup point' },
    ],
  },
  people: {
    brand: 'Northstar People',
    icon: Users,
    home: 'hr',
    showHeader: true,
    footerBrand: 'Northstar',
    navigation: [{ id: 'hr', label: 'People workspace' }],
  },
  support: {
    brand: 'Northstar Support',
    icon: MessageSquare,
    home: 'support',
    showHeader: true,
    footerBrand: 'Northstar',
    navigation: [
      { id: 'support', label: 'Inbox' },
      { id: 'chat', label: 'Team chat' },
    ],
  },
  finance: {
    brand: 'Northstar Finance',
    icon: Wallet,
    home: 'billing',
    showHeader: true,
    footerBrand: 'Northstar',
    navigation: [{ id: 'billing', label: 'Invoice management' }],
  },
  chat: {
    brand: 'Northstar',
    icon: MessageSquare,
    home: 'chat',
    showHeader: false,
    footerBrand: 'Northstar',
    navigation: [],
  },
}
