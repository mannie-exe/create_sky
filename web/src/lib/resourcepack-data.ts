import { createHash } from 'node:crypto'
import YAML from 'yaml'
import reviewSource from '../../data/authored/resourcepacks.yml?raw'
import packLock from '../../../empack.lock?raw'
import observations from '../../data/research/resourcepacks/projects.json'
import catalog from '../../data/research/resourcepacks/catalog.json'

export const statuses: Record<string, string> = {
  installed: 'Selected stack',
  try: 'Try first',
  compare: 'Compare',
  conditional: 'Requires work',
  defer: 'Defer',
  reject: 'Not a fit',
  replaced: 'Replaced',
}

export interface Review {
  id: string
  category: string
  status: string
  description: string
  fit: string
  concern: string
  nextCheck: string
}

export interface GalleryImage {
  thumbnail: string
  url: string
  caption: string
  source: string
  captured?: string
}

export interface Project {
  title: string
  url: string
  links: { label: string; url: string }[]
  gallery: GalleryImage[]
  retrieved: string
  fileNote?: string
  versionUrl?: string
  inspection: null | {
    sha512: string
    format: number
    declaresTargetFormat: boolean
    metadataWarning?: string | null
    fusionMinimum?: string | null
    fusionOverridesIncluded: boolean
    effectiveAssetCount: number
    matchingInstalledAssets: number
    matchingModNamespaces: string[]
    features: string[]
    overlaps: Record<string, { count: number; examples: string[] }>
    version: { id: string; name: string; version_type: string }
    file: { filename: string; url: string }
  }
}

export const projects = observations.projects as Record<string, Project>
export const target = observations.target
export const reviewedAt = observations.retrieved.slice(0, 10)
export const stale =
  createHash('sha256').update(packLock).digest('hex') !== target.lockSha256
export const reviews = (YAML.parse(reviewSource).candidates as Review[]).sort(
  (a, b) =>
    Object.keys(statuses).indexOf(a.status) -
    Object.keys(statuses).indexOf(b.status),
)
export { catalog }
