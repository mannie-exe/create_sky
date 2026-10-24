const search = document.querySelector<HTMLInputElement>('#pack-search')!
const decision = document.querySelector<HTMLSelectElement>('#pack-status')!
const category = document.querySelector<HTMLSelectElement>('#pack-category')!
const cards = [...document.querySelectorAll<HTMLElement>('[data-candidate]')]
const count = document.querySelector('#pack-count')!
const empty = document.querySelector<HTMLElement>('#pack-empty')!

function filter(updateUrl = true) {
  const term = search.value.trim().toLowerCase()
  let visible = 0
  for (const card of cards) {
    card.hidden =
      !card.dataset.search?.includes(term) ||
      (!!decision.value && card.dataset.status !== decision.value) ||
      (!!category.value && card.dataset.category !== category.value)
    if (!card.hidden) visible++
  }
  count.textContent = `${visible} of ${cards.length} project reviews`
  empty.hidden = visible !== 0
  if (updateUrl) {
    const url = new URL(location.href)
    for (const [key, value] of [
      ['q', search.value],
      ['decision', decision.value],
      ['scope', category.value],
    ]) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    history.replaceState(null, '', url)
  }
}
const params = new URLSearchParams(location.search)
search.value = params.get('q') || ''
decision.value = params.get('decision') || ''
category.value = params.get('scope') || ''
for (const input of [search, decision, category])
  input.addEventListener('input', () => filter())
document.querySelector('#pack-reset')!.addEventListener('click', () => {
  search.value = decision.value = category.value = ''
  filter()
})
filter(false)

// A cross-reference should reveal its target even when the current filters hide it.
function revealHash() {
  const card = cards.find((card) => `#${card.id}` === location.hash)
  if (card?.hidden) {
    search.value = decision.value = category.value = ''
    filter()
  }
  card?.scrollIntoView({ block: 'start' })
}
window.addEventListener('hashchange', revealHash)
if (location.hash) revealHash()

const viewer = document.querySelector<HTMLDialogElement>('#image-viewer')!
let activeGallery: HTMLElement | null = null
let activeIndex = 0

function buttons(gallery: HTMLElement) {
  return [...gallery.querySelectorAll<HTMLButtonElement>('[data-image]')]
}
function selectImage(gallery: HTMLElement, index: number) {
  const choices = buttons(gallery)
  const selected = choices[index]
  const image = gallery.querySelector<HTMLImageElement>('.gallery-main')!
  image.src = selected.dataset.image!
  image.alt = selected.dataset.caption!
  gallery.querySelector<HTMLAnchorElement>('[data-open-image]')!.href =
    image.src
  gallery.querySelector('[data-caption]')!.textContent = image.alt
  choices.forEach((choice, i) =>
    choice.setAttribute('aria-pressed', String(i === index)),
  )
}
function showImage(index: number) {
  if (!activeGallery) return
  const choices = buttons(activeGallery)
  activeIndex = (index + choices.length) % choices.length
  const choice = choices[activeIndex]
  const image = viewer.querySelector('img')!
  image.src = choice.dataset.image!
  image.alt = choice.dataset.caption!
  viewer.querySelector('[data-viewer-caption]')!.textContent =
    `${activeIndex + 1} / ${choices.length} · ${image.alt}`
  viewer.querySelector<HTMLAnchorElement>('[data-original]')!.href = image.src
  for (const button of viewer.querySelectorAll<HTMLButtonElement>(
    '[data-previous], [data-next]',
  ))
    button.disabled = choices.length < 2
}
for (const gallery of document.querySelectorAll<HTMLElement>(
  '[data-gallery]',
)) {
  buttons(gallery).forEach((button, index) =>
    button.addEventListener('click', () => selectImage(gallery, index)),
  )
  const image = gallery.querySelector<HTMLImageElement>('.gallery-main')!
  const error = gallery.querySelector<HTMLElement>('[data-image-error]')!
  image.addEventListener('error', () => {
    error.hidden = false
  })
  image.addEventListener('load', () => {
    error.hidden = true
  })
  if (image.complete && image.naturalWidth === 0) error.hidden = false
  gallery
    .querySelector('[data-open-image]')!
    .addEventListener('click', (event) => {
      event.preventDefault()
      activeGallery = gallery
      showImage(
        buttons(gallery).findIndex(
          (button) => button.getAttribute('aria-pressed') === 'true',
        ),
      )
      viewer.showModal()
    })
}
viewer
  .querySelector('[data-close]')!
  .addEventListener('click', () => viewer.close())
viewer
  .querySelector('[data-previous]')!
  .addEventListener('click', () => showImage(activeIndex - 1))
viewer
  .querySelector('[data-next]')!
  .addEventListener('click', () => showImage(activeIndex + 1))
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    showImage(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1))
  }
})

const catalogSearch =
  document.querySelector<HTMLInputElement>('#catalog-search')!
const rows = [
  ...document.querySelectorAll<HTMLTableRowElement>('[data-catalog-search]'),
]
catalogSearch.addEventListener('input', () => {
  let visible = 0
  for (const row of rows) {
    row.hidden = !row.dataset.catalogSearch?.includes(
      catalogSearch.value.trim().toLowerCase(),
    )
    if (!row.hidden) visible++
  }
  document.querySelector('#catalog-count')!.textContent =
    `${visible} of ${rows.length} listings`
})

export {}
