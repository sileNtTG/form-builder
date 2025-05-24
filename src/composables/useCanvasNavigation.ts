export function useCanvasNavigation() {
  /**
   * Scrolls to an element by ID or class selector and highlights it
   * @param selector - CSS selector (ID, class, or element selector)
   * @param highlightDuration - How long to show the highlight effect (default: 2000ms)
   */
  function scrollToElement(selector: string, highlightDuration = 2000) {
    // Find target element
    const targetElement = document.querySelector(selector) as HTMLElement;
    if (!targetElement) {
      console.warn(`Element not found for selector: ${selector}`);
      return;
    }

    // Simple scrollIntoView - most reliable approach
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    // Add visual highlight effect
    targetElement.classList.add("canvas-navigation-highlight");
    setTimeout(() => {
      targetElement.classList.remove("canvas-navigation-highlight");
    }, highlightDuration);
  }

  /**
   * Scrolls to an element by data-element-id
   * @param elementId - The dataId of the form element
   * @param highlightDuration - How long to show the highlight effect
   */
  function scrollToElementById(elementId: string, highlightDuration = 2000) {
    scrollToElement(`[data-element-id="${elementId}"]`, highlightDuration);
  }

  /**
   * Scrolls to the top of the canvas
   */
  function scrollToTop() {
    const canvasContainer = document.querySelector(
      ".canvas-container"
    ) as HTMLElement;
    if (canvasContainer) {
      canvasContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /**
   * Scrolls to the bottom of the canvas
   */
  function scrollToBottom() {
    const canvasContainer = document.querySelector(
      ".canvas-container"
    ) as HTMLElement;
    if (canvasContainer) {
      canvasContainer.scrollTo({
        top: canvasContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  return {
    scrollToElement,
    scrollToElementById,
    scrollToTop,
    scrollToBottom,
  };
}
