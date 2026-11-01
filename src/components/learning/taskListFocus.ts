// Solo conserva referencias DOM; las filas siguen perteneciendo a la colección.
export function captureTaskListFocus(
  checkbox: HTMLInputElement,
  fallback: HTMLElement | null,
) {
  const ownerDocument = checkbox.ownerDocument
  const hadFocus = ownerDocument.activeElement === checkbox
  const inputs = Array.from(
    checkbox
      .closest('ul')
      ?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [],
  )
  const index = inputs.indexOf(checkbox)
  const candidates = [
    checkbox,
    ...inputs.slice(index + 1),
    ...inputs.slice(0, index).reverse(),
  ]

  // Se invoca después de habilitar los controles y actualizar el DOM.
  return () => {
    const active = ownerDocument.activeElement
    if (!hadFocus || (active !== ownerDocument.body && active !== checkbox)) {
      return
    }
    const target = candidates.find(
      (input) => input.isConnected && !input.disabled,
    )
    if (target) target.focus()
    else if (fallback?.isConnected) fallback.focus()
  }
}
