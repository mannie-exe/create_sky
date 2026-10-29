import { createDisclosure } from './disclosure'
import { surveyTable as table } from './survey-table'
import { requestJSON } from './http'

type Counts = Record<string, number>
type Sample = {
  pieces?: number
  blocks?: Counts
  lootItems?: Counts
  validStart?: boolean
  placed?: { blocks: Counts }
}
type Survey = {
  capturedAt: string
  stale: boolean
  limitations: string[]
  runs: {
    seed: number
    mode: string
    samples: Sample[]
    placementFailures: string[]
  }[]
}

export async function renderStructureSurvey() {
  const target = document.getElementById('structure-survey')!
  try {
    const survey: Survey | null = await requestJSON(
      '/generated/structures.json',
    )
    target.replaceChildren()
    if (!survey) {
      target.textContent =
        'No village survey. Run pnpm data:structures, then pnpm data:compile.'
      return
    }
    const status = document.createElement('p')
    status.textContent = `${survey.stale ? 'Stale inputs — repeat survey. ' : ''}Captured ${survey.capturedAt}. Foundation and chest counts below use controlled placements; terrain ore is excluded.`
    target.append(status)
    table(
      target,
      [
        'Seed / village',
        'Pieces',
        'Diamond ore',
        'Emerald ore',
        'Chest diamonds',
        'Chest emeralds',
      ],
      survey.runs
        .filter((run) => run.mode === 'controlled')
        .flatMap((run) =>
          run.samples.map((sample, index) => [
            `${run.seed} / ${index + 1}`,
            String(sample.pieces),
            String(sample.blocks?.['minecraft:diamond_ore'] ?? 0),
            String(sample.blocks?.['minecraft:emerald_ore'] ?? 0),
            String(sample.lootItems?.['minecraft:diamond'] ?? 0),
            String(sample.lootItems?.['minecraft:emerald'] ?? 0),
          ]),
        ),
    )
    const heading = document.createElement('h3')
    heading.textContent = 'Natural Sky Archipelago placement'
    target.append(heading)
    table(
      target,
      [
        'Seed',
        'Candidate cells',
        'Valid starts',
        'Fully generated',
        'Shielded failures',
      ],
      survey.runs
        .filter((run) => run.mode === 'natural')
        .map((run) => [
          String(run.seed),
          String(run.samples.length),
          String(run.samples.filter((sample) => sample.validStart).length),
          String(run.samples.filter((sample) => sample.placed).length),
          String(run.placementFailures.length),
        ]),
    )
    const { element: details, body } = createDisclosure('Method and limits')
    for (const limitation of survey.limitations) {
      const paragraph = document.createElement('p')
      paragraph.textContent = limitation
      body.append(paragraph)
    }
    const source = document.createElement('a')
    source.href = '/generated/structures.json'
    source.textContent = 'Full counts and provenance (JSON)'
    body.append(source)
    target.append(details)
  } catch (error) {
    target.textContent = `Village survey unavailable: ${error instanceof Error ? error.message : String(error)}`
  }
}
