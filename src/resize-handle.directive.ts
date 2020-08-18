import {
  Directive,
  Input,
  HostListener,
  Renderer2,
  ElementRef,
  OnDestroy,
  NgZone
} from '@angular/core';
import { ResizableDirective } from './resizable.directive';
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
export class ResizeHandleDirective implements OnDestroy {
  /**
   * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
   */
  @Input() resizeEdges: Edges = {};

  private eventListeners: {
    touchmove?: () => void;
    mousemove?: () => void;
    [key: string]: (() => void) | undefined;
  } = {};

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private zone: NgZone,
    private resizable: ResizableDirective
  ) {}

  ngAfterViewInit(): void {
    if (this.resizable.options.forbid) {
      this.unsubscribeEventListeners();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeEventListeners();
  }

  /**
   * @hidden
   */
  @HostListener('touchstart', [
    '$event',
    '$event.touches[0].clientX',
    '$event.touches[0].clientY'
  ])
  @HostListener('mousedown', ['$event', '$event.clientX', '$event.clientY'])
  onMousedown(
    event: MouseEvent | TouchEvent,
    clientX: number,
    clientY: number
  ): void {
    event.preventDefault();
    this.zone.runOutsideAngular(() => {
      if (!this.eventListeners.touchmove) {
        this.eventListeners.touchmove = this.renderer.listen(
          this.element.nativeElement,
          'touchmove',
          (touchMoveEvent: TouchEvent) => {
            this.onMousemove(
              touchMoveEvent,
              touchMoveEvent.targetTouches[0].clientX,
              touchMoveEvent.targetTouches[0].clientY
            );
          }
        );
      }
      if (!this.eventListeners.mousemove) {
        this.eventListeners.mousemove = this.renderer.listen(
          this.element.nativeElement,
          'mousemove',
          (mouseMoveEvent: MouseEvent) => {
            this.onMousemove(
              mouseMoveEvent,
              mouseMoveEvent.clientX,
              mouseMoveEvent.clientY
            );
          }
        );
      }
      this.resizable.mousedown.next({
        clientX,
        clientY,
        edges: this.resizeEdges
      });
    });
  }

  /**
   * @hidden
   */
  @HostListener('touchend', [
    '$event.changedTouches[0].clientX',
    '$event.changedTouches[0].clientY'
  ])
  @HostListener('touchcancel', [
    '$event.changedTouches[0].clientX',
    '$event.changedTouches[0].clientY'
  ])
  @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
  onMouseup(clientX: number, clientY: number): void {
    this.zone.runOutsideAngular(() => {
      this.unsubscribeEventListeners();
      this.resizable.mouseup.next({
        clientX,
        clientY,
        edges: this.resizeEdges
      });
    });
  }

  private onMousemove(
    event: MouseEvent | TouchEvent,
    clientX: number,
    clientY: number
  ): void {
    this.resizable.mousemove.next({
      clientX,
      clientY,
      edges: this.resizeEdges,
      event
    });
  }

  private unsubscribeEventListeners(): void {
    Object.keys(this.eventListeners).forEach(type => {
      (this as any).eventListeners[type]();
      delete this.eventListeners[type];
    });
  }
}
