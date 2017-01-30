import { Directive, Input, HostListener } from '@angular/core';
import { Edges, Resizable } from './resizable.directive';

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
  @HostListener('touchend', ['$event.clientX', '$event.clientY'])
  @HostListener('touchcancel', ['$event.clientX', '$event.clientY'])
  @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
  onMouseup(mouseX: number, mouseY: number): void {
    this.resizable.mouseup.next({mouseX, mouseY, edges: this.resizeEdges});
  }

  /**
   * @private
   */
  @HostListener('touchstart', ['$event.clientX', '$event.clientY'])
  @HostListener('mousedown', ['$event.clientX', '$event.clientY'])
  onMousedown(mouseX: number, mouseY: number): void {
    this.resizable.mousedown.next({mouseX, mouseY, edges: this.resizeEdges});
  }

  /**
   * @private
   */
  @HostListener('touchmove', ['$event'])
  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    this.resizable.mousemove.next({mouseX: event.clientX, mouseY: event.clientY, edges: this.resizeEdges, event});
  }

}