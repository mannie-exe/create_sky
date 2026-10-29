import type { ComponentPropsWithoutRef } from 'react'
import type { ButtonIntent } from '../../lib/ui'

type Props = ComponentPropsWithoutRef<'button'> & { intent?: ButtonIntent }

/** Intent describes the action; native button attributes own its behavior. */
export default function Button({
  intent = 'default',
  type = 'button',
  className = '',
  ...props
}: Props) {
  return (
    <button
      {...props}
      type={type}
      className={`ui-button ${className}`}
      data-intent={intent}
    />
  )
}
