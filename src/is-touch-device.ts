/**
 * @hidden
 */
export const IS_TOUCH_DEVICE: boolean = (() => {
  // In case we're in Node.js environment.
  if (typeof window === 'undefined') {
    return false;
  } else {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }
})();
