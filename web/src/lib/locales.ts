import catalogue from './minecraft-locales.json'

const languages: Record<string, { name: string; region: string }> =
  catalogue.languages
export const minecraftVersion = catalogue.minecraft
export function localeLabel(code: string) {
  const language = languages[code]
  return language ? `${language.name} (${language.region}) · ${code}` : code
}
export const minecraftLocales = Object.keys(languages)
  .map((code) => ({ code, label: localeLabel(code) }))
  .sort((a, b) => a.label.localeCompare(b.label, 'en'))
