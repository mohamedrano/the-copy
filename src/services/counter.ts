/**
 * @function setupCounter
 * @description Sets up a counter on a button element.
 * @param {HTMLButtonElement} element - The button element to set up the counter on.
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
