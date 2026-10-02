import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { TemplateId } from './catalog'

type TemplateModule = {
  Component: LazyExoticComponent<ComponentType>
  loadSource: () => Promise<{ default: string }>
}

export const templateModules = {
  dashboard: {
    Component: lazy(() => import('./Dashboard')),
    loadSource: () => import('./Dashboard.tsx?raw'),
  },
  projects: {
    Component: lazy(() => import('./Projects')),
    loadSource: () => import('./Projects.tsx?raw'),
  },
  settings: {
    Component: lazy(() => import('./Settings')),
    loadSource: () => import('./Settings.tsx?raw'),
  },
  chat: { Component: lazy(() => import('./Chat')), loadSource: () => import('./Chat.tsx?raw') },
  hr: { Component: lazy(() => import('./HR')), loadSource: () => import('./HR.tsx?raw') },
  sorting: {
    Component: lazy(() => import('./Sorting')),
    loadSource: () => import('./Sorting.tsx?raw'),
  },
  pickup: {
    Component: lazy(() => import('./Pickup')),
    loadSource: () => import('./Pickup.tsx?raw'),
  },
  support: {
    Component: lazy(() => import('./Support')),
    loadSource: () => import('./Support.tsx?raw'),
  },
  billing: {
    Component: lazy(() => import('./Billing')),
    loadSource: () => import('./Billing.tsx?raw'),
  },
} satisfies Record<TemplateId, TemplateModule>
