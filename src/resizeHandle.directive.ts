import { Directive, Input, HostListener } from '@angular/core';
import { Resizable } from './resizable.directive';
import { Edges } from './interfaces/edges.interface';

/* tslint:disable-next-line */
const MouseEvent = (global as any).MouseEvent as MouseEvent;

/**
 * An element placed inside a `mwlResizable` directive to be used as a drag and resize handle
 *
 * For example
 *
 * ```
 * &lt;div mwlResizable&gt;
 *   &lt;div mwlResizeHandle [resizeEdges]="{bottom: true, right: true}"&gt;&lt;/div&gt;
 * &lt;/div&gt;
 * ```
 */
@Directive({
  selector: '[mwlResizeHandle]'
})
export class ResizeHandle {

  /**
   * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
   */
  @Input() resizeEdges: Edges = {};

  /**
   * @private
   */
  public resizable: Resizable; // set by the parent mwlResizable directive

  /**
   * @private
   */
  @HostListener('touchstart', ['$event.touches[0].clientX', '$event.touches[0].clientY'])
  @HostListener('mousedown', ['$event.clientX', '$event.clientY'])
  onMousedown(mouseX: number, mouseY: number): void {
    this.resizable.mousedown.next({mouseX, mouseY, edges: this.resizeEdges});
  }

  /**
   * @private
   */
  @HostListener('touchmove', ['$event', '$event.targetTouches[0].clientX', '$event.targetTouches[0].clientY'])
  @HostListener('mousemove', ['$event', '$event.clientX', '$event.clientY'])
  onMousemove(event: MouseEvent, mouseX: number, mouseY: number): void {
    this.resizable.mousemove.next({mouseX, mouseY, edges: this.resizeEdges, event});
  }

  /**
   * @private
   */
  @HostListener('touchend', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('touchcancel', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
  onMouseup(mouseX: number, mouseY: number): void {
    this.resizable.mouseup.next({mouseX, mouseY, edges: this.resizeEdges});
  }

}