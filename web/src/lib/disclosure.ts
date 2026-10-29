/** DOM counterpart of ui/Disclosure: keep native visibility and stack the body. */
export function createDisclosure(title: string) {
  const element = document.createElement('details')
  element.className = 'disclosure'
  const summary = document.createElement('summary')
  summary.textContent = title
  const body = document.createElement('div')
  body.className = 'content-stack'
  element.append(summary, body)
  return { element, body }
}
