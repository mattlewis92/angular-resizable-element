/**
 * Options for fromEvent when listening on the host.
 * Touch events need passive: false so preventDefault can be called.
 * @hidden
 */
export function getListenOptions(
  eventName: string,
): { passive: false } | Record<string, never> {
  const isTouchEvent =
    eventName === 'touchstart' ||
    eventName === 'touchend' ||
    eventName === 'touchcancel';
  return isTouchEvent ? { passive: false } : {};
}
