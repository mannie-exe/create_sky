export type ButtonIntent = 'default' | 'primary' | 'destructive'
export type FeedbackTone = 'neutral' | 'error'

/** DOM consumers share the same explicit tone contract as Feedback.tsx. */
export function setFeedback(
  element: HTMLElement,
  text: string,
  tone: FeedbackTone = 'neutral',
) {
  element.classList.add('feedback')
  element.dataset.tone = tone
  element.textContent = text
}
