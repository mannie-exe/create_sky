/** Resolve CSS colors for Canvas and renderers that need sRGB values.
 * Read a batch on scene setup/redraw, not for every point or animation frame.
 */
export function readColorTokens<K extends string>(
  element: HTMLElement,
  tokens: Record<K, `--${string}`>,
): Record<K, string> {
  const style = getComputedStyle(element)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  const colors = {} as Record<K, string>
  for (const key of Object.keys(tokens) as K[]) {
    const value = style.getPropertyValue(tokens[key]).trim()
    if (!value || !CSS.supports('color', value))
      throw new Error(`Missing or invalid color token: ${tokens[key]}`)
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = value.replace(/\bcurrentcolor\b/gi, style.color)
    context.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
    colors[key] = `rgba(${r}, ${g}, ${b}, ${a / 255})`
  }
  return colors
}
