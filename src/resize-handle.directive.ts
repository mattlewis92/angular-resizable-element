import { Directive, Input, HostListener, Renderer2, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { Resizable } from './resizable.directive';
import { Edges } from './interfaces/edges.interface';

/**
 * An element placed inside a `mwlResizable` directive to be used as a drag and resize handle
 *
 * For example
 *
 * ```html
 * <div mwlResizable>
 *   <div mwlResizeHandle [resizeEdges]="{bottom: true, right: true}"></div>
 * </div>
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

  constructor(private renderer: Renderer2, private element: ElementRef, private zone: NgZone) {}

  ngOnDestroy(): void {
    this.unsubscribeEventListeners();
  }

  /**
   * @private
   */
  @HostListener('touchstart', ['$event', '$event.touches[0].clientX', '$event.touches[0].clientY'])
  @HostListener('mousedown', ['$event', '$event.clientX', '$event.clientY'])
  onMousedown(event: any, mouseX: number, mouseY: number): void {
    event.preventDefault();
    this.zone.runOutsideAngular(() => {
      if (!this.eventListeners.touchmove) {
        this.eventListeners.touchmove = this.renderer.listen(this.element.nativeElement, 'touchmove', (event: any) => {
          this.onMousemove(event, event.targetTouches[0].clientX, event.targetTouches[0].clientY);
        });
      }
      if (!this.eventListeners.mousemove) {
        this.eventListeners.mousemove = this.renderer.listen(this.element.nativeElement, 'mousemove', (event: any) => {
          this.onMousemove(event, event.clientX, event.clientY);
        });
      }
      this.resizable.mousedown.next({mouseX, mouseY, edges: this.resizeEdges});
    });
  }

  /**
   * @private
   */
  @HostListener('touchend', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('touchcancel', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
  onMouseup(mouseX: number, mouseY: number): void {
    this.zone.runOutsideAngular(() => {
      this.unsubscribeEventListeners();
      this.resizable.mouseup.next({mouseX, mouseY, edges: this.resizeEdges});
    });
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
