/**
 * Check if the event is a touch event
 * @param event - The event to check
 * @returns True if the event is a touch event, false otherwise
 * @hidden
 */

export function isTouchEvent(event: Event): boolean {
  return event.type.startsWith('touch');
}
