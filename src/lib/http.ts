export async function requestJSON(url: string, body?: unknown) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...(body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  })
  let value
  try {
    value = await response.json()
  } catch {
    throw new Error(
      url.startsWith('/__atlas/')
        ? 'Local editing requires pnpm dev and a configured pack directory.'
        : `${url}: expected JSON (HTTP ${response.status})`,
    )
  }
  if (!response.ok)
    throw new Error(value?.error || `${url}: ${response.status}`)
  return value
}
