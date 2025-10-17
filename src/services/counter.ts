/**
 * Wires a click-driven counter to the provided button element for demo
 * interactions.
 *
 * @param element - The button element whose label should display the count.
 * @returns void - This helper mutates the supplied DOM node in place.
 */
export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
