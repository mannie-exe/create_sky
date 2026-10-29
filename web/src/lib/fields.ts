/** Keep description IDs identical in React, Astro and generated DOM fields. */
export function fieldControl(id: string, { hint = false, error = false } = {}) {
  const descriptions = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ')
  return {
    id,
    'aria-describedby': descriptions || undefined,
    'aria-invalid': error ? (true as const) : undefined,
  }
}

/** Numeric model fields are generated dynamically but keep the same label contract. */
export function createField(labelText: string, control: HTMLInputElement) {
  const element = document.createElement('div')
  element.className = 'field'
  const label = document.createElement('label')
  label.htmlFor = control.id
  label.textContent = labelText
  element.append(label, control)
  return element
}
