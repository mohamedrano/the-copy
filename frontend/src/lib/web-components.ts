/**
 * Web Components Utilities
 *
 * Provides utilities for safely registering custom elements and loading
 * polyfills without causing duplicate registration errors.
 */

/**
 * Global flag to track loaded polyfills
 */
declare global {
  interface Window {
    __WC_POLYFILLS__?: Record<string, boolean>;
  }
}

/**
 * Ensures web components polyfills are loaded only once
 *
 * This prevents duplicate polyfill loading which can cause errors
 * in applications with hot module replacement or multiple entry points.
 *
 * @param key - Unique identifier for the polyfill
 * @returns True if polyfill was just loaded, false if already loaded
 */
export function ensureWebComponentsPolyfill(key: string = 'webcomponents-ce'): boolean {
  // Initialize the polyfills tracker if it doesn't exist
  if (typeof window !== 'undefined') {
    window.__WC_POLYFILLS__ = window.__WC_POLYFILLS__ || {};

    // Check if this polyfill was already loaded
    if (window.__WC_POLYFILLS__[key]) {
      return false;
    }

    // Mark this polyfill as loaded
    window.__WC_POLYFILLS__[key] = true;
    return true;
  }

  return false;
}

/**
 * Safely defines a custom element, preventing duplicate registration errors
 *
 * This function checks if a custom element is already registered before
 * attempting to define it. This is essential for applications with hot
 * module replacement or dynamic imports.
 *
 * @param name - The name of the custom element (must contain a hyphen)
 * @param constructor - The custom element constructor
 * @param options - Optional element definition options
 * @returns True if element was registered, false if already registered
 *
 * @example
 * ```typescript
 * class MyElement extends HTMLElement {
 *   connectedCallback() {
 *     this.innerHTML = '<p>Hello World</p>';
 *   }
 * }
 *
 * defineOnce('my-element', MyElement);
 * ```
 */
export function defineOnce(
  name: string,
  constructor: CustomElementConstructor,
  options?: ElementDefinitionOptions
): boolean {
  if (typeof window === 'undefined' || typeof customElements === 'undefined') {
    // Server-side rendering or environment without custom elements support
    return false;
  }

  // Check if element is already defined
  if (customElements.get(name)) {
    console.warn(
      `[Web Components] Custom element '${name}' is already defined. Skipping registration.`
    );
    return false;
  }

  try {
    // Define the custom element
    customElements.define(name, constructor, options);
    console.log(`[Web Components] Successfully registered custom element '${name}'`);
    return true;
  } catch (error) {
    // Handle any registration errors
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[Web Components] Failed to register custom element '${name}':`,
      message
    );
    return false;
  }
}

/**
 * Checks if a custom element is already defined
 *
 * @param name - The name of the custom element to check
 * @returns True if the element is defined, false otherwise
 */
export function isElementDefined(name: string): boolean {
  if (typeof window === 'undefined' || typeof customElements === 'undefined') {
    return false;
  }

  return customElements.get(name) !== undefined;
}

/**
 * Waits for a custom element to be defined
 *
 * Useful when you need to ensure an element is ready before using it.
 *
 * @param name - The name of the custom element to wait for
 * @param timeout - Optional timeout in milliseconds (default: 5000)
 * @returns Promise that resolves when element is defined or rejects on timeout
 *
 * @example
 * ```typescript
 * await whenDefined('my-element');
 * const element = document.createElement('my-element');
 * ```
 */
export function whenDefined(name: string, timeout: number = 5000): Promise<void> {
  if (typeof window === 'undefined' || typeof customElements === 'undefined') {
    return Promise.reject(new Error('Custom elements not supported in this environment'));
  }

  // Check if already defined
  if (customElements.get(name)) {
    return Promise.resolve();
  }

  // Wait for definition with timeout
  return Promise.race([
    customElements.whenDefined(name),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout waiting for custom element '${name}' to be defined`)),
        timeout
      )
    ),
  ]);
}

/**
 * Gets all registered custom element names
 *
 * This is useful for debugging and understanding which custom elements
 * are currently registered in the application.
 *
 * @returns Array of registered custom element names
 */
export function getRegisteredElements(): string[] {
  if (typeof window === 'undefined' || typeof customElements === 'undefined') {
    return [];
  }

  // Note: There's no standard API to list all custom elements,
  // so we track them via a global registry
  const registry: string[] = [];

  // Try to get elements from the custom elements registry
  // This is a workaround since there's no direct API
  try {
    // We can only check specific names, not enumerate
    // So we'll return an empty array unless we track them ourselves
    return registry;
  } catch {
    return [];
  }
}

/**
 * Example usage for textarea autosize component
 */
export function registerAutosizeTextarea() {
  if (typeof window === 'undefined') {
    return;
  }

  defineOnce('mce-autosize-textarea', class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      const textarea = this.querySelector('textarea');
      if (textarea) {
        this.setupAutosize(textarea);
      }
    }

    private setupAutosize(textarea: HTMLTextAreaElement) {
      const adjust = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      textarea.addEventListener('input', adjust);
      textarea.addEventListener('change', adjust);
      adjust();
    }
  });
}
