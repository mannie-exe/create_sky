// The index follows the continuous document; filters remain owned by resourcepacks.
export function createReviewIndex(cards: HTMLElement[]) {
  const index = document.querySelector<HTMLElement>('#resource-index')!
  const back = document.querySelector<HTMLAnchorElement>(
    '[data-resource-index-back]',
  )!
  const choices = new Map(
    [...index.querySelectorAll<HTMLAnchorElement>('[data-review-link]')].map(
      (link) => [link.dataset.reviewLink!, link],
    ),
  )
  let current = location.hash.slice(1)
  let frame = 0

  function keepChoiceVisible() {
    const choice = choices.get(current)
    if (!choice) return
    const bounds = index.getBoundingClientRect()
    const item = choice.getBoundingClientRect()
    if (item.top < bounds.top) index.scrollTop += item.top - bounds.top
    else if (item.bottom > bounds.bottom)
      index.scrollTop += item.bottom - bounds.bottom
  }

  function refresh() {
    if (!cards.some((card) => card.id === current && !card.hidden))
      current = cards.find((card) => !card.hidden)?.id ?? ''
    for (const card of cards) {
      const choice = choices.get(card.id)!
      choice.hidden = card.hidden
      if (card.id === current && !card.hidden)
        choice.setAttribute('aria-current', 'location')
      else choice.removeAttribute('aria-current')
    }
    back.hidden = !current
    keepChoiceVisible()
  }

  function reveal(id: string) {
    current = id
    refresh()
  }

  for (const card of cards)
    choices.get(card.id)!.addEventListener('click', (event) => {
      event.preventDefault()
      const url = new URL(location.href)
      url.hash = card.id
      history.replaceState(null, '', url)
      reveal(card.id)
      const heading = card.querySelector<HTMLElement>('h2')!
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
      heading.scrollIntoView({ block: 'start' })
    })

  back.addEventListener('click', (event) => {
    event.preventDefault()
    choices.get(current)?.focus({ preventScroll: true })
    index.scrollIntoView({ block: 'start' })
  })

  function followReading() {
    frame = 0
    const visible = cards.filter((card) => !card.hidden)
    const threshold = Math.min(innerHeight * 0.3, 240)
    // A short final review cannot reach the reading line at maximum scroll.
    const atEnd =
      scrollY + innerHeight >= document.documentElement.scrollHeight - 1
    const active =
      (atEnd
        ? visible.at(-1)
        : visible
            .filter((card) => card.getBoundingClientRect().top <= threshold)
            .at(-1)) ?? visible[0]
    if (active && active.id !== current) reveal(active.id)
    else keepChoiceVisible()
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(followReading)
  }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  window.addEventListener('load', schedule, { once: true })
  return { refresh, reveal }
}
