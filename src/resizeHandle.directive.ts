import { Directive, Input, HostListener, Renderer, ElementRef, OnDestroy } from '@angular/core';
import { Resizable } from './resizable.directive';
import { Edges } from './interfaces/edges.interface';

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
export class ResizeHandle implements OnDestroy {

  /**
   * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
   */
  @Input() resizeEdges: Edges = {};

  /**
   * @private
   */
  public resizable: Resizable; // set by the parent mwlResizable directive

  private eventListeners: {
    touchmove?: Function,
    mousemove?: Function
  } = {};

  constructor(private renderer: Renderer, private element: ElementRef) {}

  ngOnDestroy(): void {
    this.unsubscribeEventListeners();
  }

  /**
   * @private
   */
  @HostListener('touchstart', ['$event.touches[0].clientX', '$event.touches[0].clientY'])
  @HostListener('mousedown', ['$event.clientX', '$event.clientY'])
  onMousedown(mouseX: number, mouseY: number): void {
    this.eventListeners.touchmove = this.renderer.listen(this.element.nativeElement, 'touchmove', (event: any) => {
      this.onMousemove(event, event.targetTouches[0].clientX, event.targetTouches[0].clientY);
    });
    this.eventListeners.mousemove = this.renderer.listen(this.element.nativeElement, 'mousemove', (event: any) => {
      this.onMousemove(event, event.clientX, event.clientY);
    });
    this.resizable.mousedown.next({mouseX, mouseY, edges: this.resizeEdges});
  }

  /**
   * @private
   */
  @HostListener('touchend', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('touchcancel', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
  onMouseup(mouseX: number, mouseY: number): void {
    this.unsubscribeEventListeners();
    this.resizable.mouseup.next({mouseX, mouseY, edges: this.resizeEdges});
  }

  private onMousemove(event: any, mouseX: number, mouseY: number): void {
    this.resizable.mousemove.next({mouseX, mouseY, edges: this.resizeEdges, event});
  }

  private unsubscribeEventListeners(): void {
    Object.keys(this.eventListeners).forEach(type => {
      this.eventListeners[type]();
      delete this.eventListeners[type];
    });
  }

}