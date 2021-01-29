import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResizableDirective } from './resizable.directive';
import { Edges } from './interfaces/edges.interface';
import { IS_TOUCH_DEVICE } from './is-touch-device';

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
export class ResizeHandleDirective implements OnInit, OnDestroy {
  /**
   * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
   */
  @Input() resizeEdges: Edges = {};

  private eventListeners: {
    touchmove?: () => void;
    mousemove?: () => void;
    [key: string]: (() => void) | undefined;
  } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private zone: NgZone,
    private resizable: ResizableDirective
  ) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.listenOnTheHost<MouseEvent>('mousedown').subscribe(event => {
        this.onMousedown(event, event.clientX, event.clientY);
      });

      this.listenOnTheHost<MouseEvent>('mouseup').subscribe(event => {
        this.onMouseup(event.clientX, event.clientY);
      });

      if (IS_TOUCH_DEVICE) {
        this.listenOnTheHost<TouchEvent>('touchstart').subscribe(event => {
          this.onMousedown(
            event,
            event.touches[0].clientX,
            event.touches[0].clientY
          );
        });

        merge(
          this.listenOnTheHost<TouchEvent>('touchend'),
          this.listenOnTheHost<TouchEvent>('touchcancel')
        ).subscribe(event => {
          this.onMouseup(
            event.changedTouches[0].clientX,
            event.changedTouches[0].clientY
          );
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.unsubscribeEventListeners();
  }

  /**
   * @hidden
   */
  onMousedown(
    event: MouseEvent | TouchEvent,
    clientX: number,
    clientY: number
  ): void {
    event.preventDefault();
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
  }

  /**
   * @hidden
   */
  onMouseup(clientX: number, clientY: number): void {
    this.unsubscribeEventListeners();
    this.resizable.mouseup.next({
      clientX,
      clientY,
      edges: this.resizeEdges
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

  private listenOnTheHost<T extends Event>(eventName: string) {
    return fromEvent<T>(this.element.nativeElement, eventName).pipe(
      takeUntil(this.destroy$)
    );
  }
}
