import { requestJSON } from './http'
import { surveyTable } from './survey-table'

type Counts = Record<string, number>
type Descriptor = { x: number; y?: number; z: number; family: string }
type TerrainIsland = {
  targetHeight?: number
  sampledMinY: number
  sampledMaxY: number
  estimatedSolidVolume: number
}
type ResourceIsland = {
  descriptor: Descriptor
  companionDescriptors?: unknown[]
  straightRoute?: { longestVoidGapBlocks: number }
  nearestCenterDistance: number
  descriptorEdgeGap: number
  surfaceOpeningColumns?: number
  observedHeadroom?: number
  observedAnchorColumns: number
  observedBlocks: Counts
  estimatedBlocks: Counts
  elapsedSeconds: number
  samples: unknown[]
}
type Survey = {
  status: string
  terrain: {
    runs: {
      seed: string | number
      adapted: boolean
      nearestAnchorDistances: number[]
      clusterClearances?: {
        centerY: number
        minimumSupportGap: number
      }[]
      clusterFootprints?: { sampledShoreGap: number }[]
      descriptors: Descriptor[]
      islands: TerrainIsland[]
    }[]
  }
  resources: {
    seed: string | number
    referenceSurfaceY?: number
    method: string
    limitations: string
    artifacts: Record<string, string>
    maximumHeap?: string
    heapUsedAtEndBytes: number
    wallSecondsIncludingStartup: number
    islands: ResourceIsland[]
  }[]
}
const number = (n: number) =>
  new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(n)
const mean = (values: number[]) =>
  values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)
const ore = (counts: Counts, name: string) =>
  Object.entries(counts).reduce(
    (total, [id, n]) =>
      total +
      (id.endsWith(`:${name}_ore`) || id.endsWith(`:deepslate_${name}_ore`)
        ? n
        : 0),
    0,
  )

export async function renderIslandSurvey() {
  const target = document.getElementById('island-survey')!
  target.replaceChildren()
  try {
    const survey: Survey | null = await requestJSON('/generated/islands.json')
    if (!survey) {
      target.textContent =
        'No island survey imported. Run pnpm data:islands with native reports, then pnpm data:compile.'
      return
    }
    const status = document.createElement('p')
    status.textContent = survey.status
    target.append(status)
    const heading = document.createElement('h3')
    heading.textContent = 'Predicted terrain before carving and features'
    target.append(heading)
    surveyTable(
      target,
      [
        'Seed / preset',
        'Anchors / companions in query',
        'Mean nearest anchor (blocks)',
        'Anchor center Y range',
        'Minimum support-envelope gap (blocks)',
        'Mean sampled shore gap (blocks)',
        'Target height range (blocks)',
        'Sampled height range (blocks)',
        'Mean sampled height (blocks)',
        'Mean estimated solid volume (blocks)',
      ],
      survey.terrain.runs.map((run) => [
        `${run.seed} / ${run.adapted ? 'expanded' : 'ordinary'}`,
        `${run.descriptors.filter((d) => d.family === 'ANCHOR_PLATEAU').length} / ${run.descriptors.filter((d) => d.family !== 'ANCHOR_PLATEAU').length}`,
        number(mean(run.nearestAnchorDistances)),
        run.clusterClearances?.length
          ? `${Math.min(...run.clusterClearances.map((c) => c.centerY))}–${Math.max(...run.clusterClearances.map((c) => c.centerY))}`
          : 'Not captured',
        run.clusterClearances?.length
          ? number(
              Math.min(
                ...run.clusterClearances.map((c) => c.minimumSupportGap),
              ),
            )
          : 'Not captured',
        run.clusterFootprints?.length
          ? number(mean(run.clusterFootprints.map((c) => c.sampledShoreGap)))
          : 'Not captured',
        run.islands.every((i) => i.targetHeight !== undefined)
          ? `${Math.min(...run.islands.map((i) => i.targetHeight!))}–${Math.max(...run.islands.map((i) => i.targetHeight!))}`
          : 'Native',
        `${Math.min(...run.islands.map((i) => i.sampledMaxY - i.sampledMinY + 1))}–${Math.max(...run.islands.map((i) => i.sampledMaxY - i.sampledMinY + 1))}`,
        number(mean(run.islands.map((i) => i.sampledMaxY - i.sampledMinY + 1))),
        number(mean(run.islands.map((i) => i.estimatedSolidVolume))),
      ]),
    )
    for (const run of survey.resources) {
      const heading = document.createElement('h3')
      heading.textContent = `Generated resource samples: seed ${run.seed}`
      target.append(heading)
      surveyTable(
        target,
        [
          'Anchor X, Y, Z',
          'Native companions',
          'Sampled chunks / anchor columns',
          'Nearest center / descriptor gap (blocks)',
          'Longest sampled straight-line void gap (blocks)',
          'Sampled headroom (blocks)',
          'Surface-opening columns',
          'Zinc observed / estimated',
          'Diamond observed / estimated',
          'Platinum observed / estimated',
          'Generation and scan (s)',
        ],
        run.islands.map((i) => [
          `${i.descriptor.x}, ${i.descriptor.y ?? '?'}, ${i.descriptor.z}`,
          i.companionDescriptors
            ? String(i.companionDescriptors.length)
            : 'Not captured',
          `${i.samples.length} / ${i.observedAnchorColumns}`,
          `${number(i.nearestCenterDistance)} / ${number(i.descriptorEdgeGap)}`,
          i.straightRoute
            ? number(i.straightRoute.longestVoidGapBlocks)
            : 'Not captured',
          i.observedHeadroom === undefined
            ? 'No occupied sample'
            : number(i.observedHeadroom),
          i.surfaceOpeningColumns === undefined
            ? 'Not captured'
            : number(i.surfaceOpeningColumns),
          ...['zinc', 'diamond', 'platinum'].map(
            (name) =>
              `${number(ore(i.observedBlocks, name))} / ${number(ore(i.estimatedBlocks, name))}`,
          ),
          number(i.elapsedSeconds),
        ]),
      )
      const details = document.createElement('details')
      const summary = document.createElement('summary')
      summary.textContent = 'Sampling method, limits and tested artifacts'
      details.append(summary)
      for (const text of [
        run.method,
        run.limitations,
        run.referenceSurfaceY === 64
          ? 'Reference −64…64 maps from geological bottom to anchor surface. Above 64, offsets retain block scale. Surface openings are generated air cuts, not verified walkable cave routes.'
          : 'Historical height mapping; consult the source report.',
        'Support-envelope gaps are conservative bounds. Shore gaps sample complete clusters on a 16-block grid for nearest-center pairs; they are not exact shortest crossings.',
        `Heap at scan end: ${number(run.heapUsedAtEndBytes / 1024 ** 3)} GiB; configured maximum: ${run.maximumHeap ?? 'not recorded'}. This is not peak usage. Total runtime including startup: ${number(run.wallSecondsIncludingStartup)} s.`,
        ...Object.entries(run.artifacts).map(([id, hash]) => `${id}: ${hash}`),
      ]) {
        const p = document.createElement('p')
        p.textContent = text
        details.append(p)
      }
      target.append(details)
    }
    const source = document.createElement('a')
    source.href = '/generated/islands.json'
    source.textContent =
      'Descriptors, per-sample blocks, relative ore depths and provenance (JSON)'
    target.append(source)
  } catch (error) {
    target.textContent = `Island survey unavailable: ${error instanceof Error ? error.message : String(error)}`
  }
}
