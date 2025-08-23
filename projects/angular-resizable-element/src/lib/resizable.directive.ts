import {
  Directive,
  Renderer2,
  ElementRef,
  OnInit,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  NgZone,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable, Observer, merge } from 'rxjs';
import {
  map,
  mergeMap,
  takeUntil,
  filter,
  pairwise,
  take,
  share,
  tap,
} from 'rxjs/operators';
import { Edges } from './interfaces/edges.interface';
import { BoundingRectangle } from './interfaces/bounding-rectangle.interface';
import { ResizeEvent } from './interfaces/resize-event.interface';
import { IS_TOUCH_DEVICE } from './util/is-touch-device';
import { deepCloneNode } from './util/clone-node';

interface PointerEventCoordinate {
  clientX: number;
  clientY: number;
  event: MouseEvent | TouchEvent;
}

interface Coordinate {
  x: number;
  y: number;
}

function getNewBoundingRectangle(
  startingRect: BoundingRectangle,
  edges: Edges,
  clientX: number,
  clientY: number,
): BoundingRectangle {
  const newBoundingRect: BoundingRectangle = {
    top: startingRect.top,
    bottom: startingRect.bottom,
    left: startingRect.left,
    right: startingRect.right,
  };

  if (edges.top) {
    newBoundingRect.top += clientY;
  }
  if (edges.bottom) {
    newBoundingRect.bottom += clientY;
  }
  if (edges.left) {
    newBoundingRect.left += clientX;
  }
  if (edges.right) {
    newBoundingRect.right += clientX;
  }
  newBoundingRect.height = newBoundingRect.bottom - newBoundingRect.top;
  newBoundingRect.width = newBoundingRect.right - newBoundingRect.left;

  return newBoundingRect;
}

function getElementRect(
  element: ElementRef,
  ghostElementPositioning: string,
): BoundingRectangle {
  let translateX = 0;
  let translateY = 0;
  const style = element.nativeElement.style;
  const transformProperties = [
    'transform',
    '-ms-transform',
    '-moz-transform',
    '-o-transform',
  ];
  const transform = transformProperties
    .map((property) => style[property])
    .find((value) => !!value);
  if (transform && transform.includes('translate')) {
    translateX = transform.replace(
      /.*translate3?d?\((-?[0-9]*)px, (-?[0-9]*)px.*/,
      '$1',
    );
    translateY = transform.replace(
      /.*translate3?d?\((-?[0-9]*)px, (-?[0-9]*)px.*/,
      '$2',
    );
  }

  if (ghostElementPositioning === 'absolute') {
    return {
      height: element.nativeElement.offsetHeight,
      width: element.nativeElement.offsetWidth,
      top: element.nativeElement.offsetTop - translateY,
      bottom:
        element.nativeElement.offsetHeight +
        element.nativeElement.offsetTop -
        translateY,
      left: element.nativeElement.offsetLeft - translateX,
      right:
        element.nativeElement.offsetWidth +
        element.nativeElement.offsetLeft -
        translateX,
    };
  } else {
    const boundingRect: BoundingRectangle =
      element.nativeElement.getBoundingClientRect();
    return {
      height: boundingRect.height,
      width: boundingRect.width,
      top: boundingRect.top - translateY,
      bottom: boundingRect.bottom - translateY,
      left: boundingRect.left - translateX,
      right: boundingRect.right - translateX,
      scrollTop: element.nativeElement.scrollTop,
      scrollLeft: element.nativeElement.scrollLeft,
    };
  }
}

export interface ResizeCursors {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  leftOrRight: string;
  topOrBottom: string;
}

const DEFAULT_RESIZE_CURSORS: ResizeCursors = Object.freeze({
  topLeft: 'nw-resize',
  topRight: 'ne-resize',
  bottomLeft: 'sw-resize',
  bottomRight: 'se-resize',
  leftOrRight: 'col-resize',
  topOrBottom: 'row-resize',
});

function getResizeCursor(edges: Edges, cursors: ResizeCursors): string {
  if (edges.left && edges.top) {
    return cursors.topLeft;
  } else if (edges.right && edges.top) {
    return cursors.topRight;
  } else if (edges.left && edges.bottom) {
    return cursors.bottomLeft;
  } else if (edges.right && edges.bottom) {
    return cursors.bottomRight;
  } else if (edges.left || edges.right) {
    return cursors.leftOrRight;
  } else if (edges.top || edges.bottom) {
    return cursors.topOrBottom;
  } else {
    return '';
  }
}

function getEdgesDiff({
  edges,
  initialRectangle,
  newRectangle,
}: {
  edges: Edges;
  initialRectangle: BoundingRectangle;
  newRectangle: BoundingRectangle;
}): Edges {
  const edgesDiff: Edges = {};
  Object.keys(edges).forEach((edge) => {
    edgesDiff[edge] = (newRectangle[edge] || 0) - (initialRectangle[edge] || 0);
  });
  return edgesDiff;
}

const RESIZE_ACTIVE_CLASS: string = 'resize-active';
const RESIZE_GHOST_ELEMENT_CLASS: string = 'resize-ghost-element';

export const MOUSE_MOVE_THROTTLE_MS: number = 50;

/**
 * Place this on an element to make it resizable. For example:
 *
 * ```html
 * <div
 *   mwlResizable
 *   [resizeEdges]="{bottom: true, right: true, top: true, left: true}"
 *   [enableGhostResize]="true">
 * </div>
 * ```
 * Or in case they are sibling elements:
 * ```html
 * <div mwlResizable #resizableElement="mwlResizable"></div>
 * <div mwlResizeHandle [resizableContainer]="resizableElement" [resizeEdges]="{bottom: true, right: true}"></div>
 * ```
 */
@Directive({
  selector: '[mwlResizable]',
  exportAs: 'mwlResizable',
  standalone: false,
})
export class ResizableDirective implements OnInit, OnDestroy {
  /**
   * A function that will be called before each resize event. Return `true` to allow the resize event to propagate or `false` to cancel it
   */
  @Input() validateResize: (resizeEvent: ResizeEvent) => boolean;

  /**
   * Set to `true` to enable a temporary resizing effect of the element in between the `resizeStart` and `resizeEnd` events.
   */
  @Input() enableGhostResize: boolean = false;

  /**
   * A snap grid that resize events will be locked to.
   *
   * e.g. to only allow the element to be resized every 10px set it to `{left: 10, right: 10}`
   */
  @Input() resizeSnapGrid: Edges = {};

  /**
   * The mouse cursors that will be set on the resize edges
   */
  @Input() resizeCursors: Partial<ResizeCursors> = DEFAULT_RESIZE_CURSORS;

  /**
   * Define the positioning of the ghost element (can be fixed or absolute)
   */
  @Input() ghostElementPositioning: 'fixed' | 'absolute' = 'fixed';

  /**
   * Allow elements to be resized to negative dimensions
   */
  @Input() allowNegativeResizes: boolean = false;

  /**
   * The mouse move throttle in milliseconds, default: 50 ms
   */
  @Input() mouseMoveThrottleMS: number = MOUSE_MOVE_THROTTLE_MS;

  /**
   * Called when the mouse is pressed and a resize event is about to begin. `$event` is a `ResizeEvent` object.
   */
  @Output() resizeStart = new EventEmitter<ResizeEvent>();

  /**
   * Called as the mouse is dragged after a resize event has begun. `$event` is a `ResizeEvent` object.
   */
  @Output() resizing = new EventEmitter<ResizeEvent>();

  /**
   * Called after the mouse is released after a resize event. `$event` is a `ResizeEvent` object.
   */
  @Output() resizeEnd = new EventEmitter<ResizeEvent>();

  /**
   * @hidden
   */
  public mouseup = new Subject<{
    clientX: number;
    clientY: number;
    edges?: Edges;
  }>();

  /**
   * @hidden
   */
  public mousedown = new Subject<{
    clientX: number;
    clientY: number;
    edges?: Edges;
  }>();

  /**
   * @hidden
   */
  public mousemove = new Subject<{
    clientX: number;
    clientY: number;
    edges?: Edges;
    event: MouseEvent | TouchEvent;
  }>();

  private pointerEventListeners: PointerEventListeners;

  private destroy$ = new Subject<void>();

  private platformId = inject(PLATFORM_ID);

  private renderer = inject(Renderer2);

  private elm = inject(ElementRef);

  private zone = inject(NgZone);

  /**
   * @hidden
   */
  constructor() {
    this.pointerEventListeners = PointerEventListeners.getInstance(
      this.renderer,
      this.zone,
    );
  }

  /**
   * @hidden
   */
  ngOnInit(): void {
    const mousedown$: Observable<{
      clientX: number;
      clientY: number;
      edges?: Edges;
    }> = merge(this.pointerEventListeners.pointerDown, this.mousedown);

    const mousemove$ = merge(
      this.pointerEventListeners.pointerMove,
      this.mousemove,
    ).pipe(
      tap(({ event }) => {
        if (currentResize && event.cancelable) {
          event.preventDefault();
        }
      }),
      share(),
    );

    const mouseup$ = merge(this.pointerEventListeners.pointerUp, this.mouseup);

    let currentResize: {
      edges: Edges;
      startingRect: BoundingRectangle;
      currentRect: BoundingRectangle;
      clonedNode?: HTMLElement;
    } | null;

    const removeGhostElement = () => {
      if (currentResize && currentResize.clonedNode) {
        this.elm.nativeElement.parentElement.removeChild(
          currentResize.clonedNode,
        );
        this.renderer.setStyle(this.elm.nativeElement, 'visibility', 'inherit');
      }
    };

    const getResizeCursors = (): ResizeCursors => {
      return {
        ...DEFAULT_RESIZE_CURSORS,
        ...this.resizeCursors,
      };
    };

    const mousedrag: Observable<any> = mousedown$
      .pipe(
        mergeMap((startCoords) => {
          function getDiff(moveCoords: { clientX: number; clientY: number }) {
            return {
              clientX: moveCoords.clientX - startCoords.clientX,
              clientY: moveCoords.clientY - startCoords.clientY,
            };
          }

          const getSnapGrid = () => {
            const snapGrid: Coordinate = { x: 1, y: 1 };

            if (currentResize) {
              if (this.resizeSnapGrid.left && currentResize.edges.left) {
                snapGrid.x = +this.resizeSnapGrid.left;
              } else if (
                this.resizeSnapGrid.right &&
                currentResize.edges.right
              ) {
                snapGrid.x = +this.resizeSnapGrid.right;
              }

              if (this.resizeSnapGrid.top && currentResize.edges.top) {
                snapGrid.y = +this.resizeSnapGrid.top;
              } else if (
                this.resizeSnapGrid.bottom &&
                currentResize.edges.bottom
              ) {
                snapGrid.y = +this.resizeSnapGrid.bottom;
              }
            }

            return snapGrid;
          };

          function getGrid(
            coords: { clientX: number; clientY: number },
            snapGrid: Coordinate,
          ) {
            return {
              x: Math.ceil(coords.clientX / snapGrid.x),
              y: Math.ceil(coords.clientY / snapGrid.y),
            };
          }

          return (
            merge(
              mousemove$.pipe(take(1)).pipe(map((coords) => [, coords])),
              mousemove$.pipe(pairwise()),
            ) as Observable<
              [
                { clientX: number; clientY: number },
                { clientX: number; clientY: number },
              ]
            >
          )
            .pipe(
              map(([previousCoords, newCoords]) => {
                return [
                  previousCoords ? getDiff(previousCoords) : previousCoords,
                  getDiff(newCoords),
                ];
              }),
            )
            .pipe(
              filter(([previousCoords, newCoords]) => {
                if (!previousCoords) {
                  return true;
                }

                const snapGrid: Coordinate = getSnapGrid();
                const previousGrid: Coordinate = getGrid(
                  previousCoords,
                  snapGrid,
                );
                const newGrid: Coordinate = getGrid(newCoords, snapGrid);

                return (
                  previousGrid.x !== newGrid.x || previousGrid.y !== newGrid.y
                );
              }),
            )
            .pipe(
              map(([, newCoords]) => {
                const snapGrid: Coordinate = getSnapGrid();
                return {
                  clientX:
                    Math.round(newCoords.clientX / snapGrid.x) * snapGrid.x,
                  clientY:
                    Math.round(newCoords.clientY / snapGrid.y) * snapGrid.y,
                };
              }),
            )
            .pipe(takeUntil(merge(mouseup$, mousedown$)));
        }),
      )
      .pipe(filter(() => !!currentResize));

    mousedrag
      .pipe(
        map(({ clientX, clientY }) => {
          return getNewBoundingRectangle(
            currentResize!.startingRect,
            currentResize!.edges,
            clientX,
            clientY,
          );
        }),
      )
      .pipe(
        filter((newBoundingRect: BoundingRectangle) => {
          return (
            this.allowNegativeResizes ||
            !!(
              newBoundingRect.height &&
              newBoundingRect.width &&
              newBoundingRect.height > 0 &&
              newBoundingRect.width > 0
            )
          );
        }),
      )
      .pipe(
        filter((newBoundingRect: BoundingRectangle) => {
          return this.validateResize
            ? this.validateResize({
                rectangle: newBoundingRect,
                edges: getEdgesDiff({
                  edges: currentResize!.edges,
                  initialRectangle: currentResize!.startingRect,
                  newRectangle: newBoundingRect,
                }),
              })
            : true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((newBoundingRect: BoundingRectangle) => {
        if (currentResize && currentResize.clonedNode) {
          this.renderer.setStyle(
            currentResize.clonedNode,
            'height',
            `${newBoundingRect.height}px`,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'width',
            `${newBoundingRect.width}px`,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'top',
            `${newBoundingRect.top}px`,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'left',
            `${newBoundingRect.left}px`,
          );
        }

        if (this.resizing.observers.length > 0) {
          this.zone.run(() => {
            this.resizing.emit({
              edges: getEdgesDiff({
                edges: currentResize!.edges,
                initialRectangle: currentResize!.startingRect,
                newRectangle: newBoundingRect,
              }),
              rectangle: newBoundingRect,
            });
          });
        }
        currentResize!.currentRect = newBoundingRect;
      });

    mousedown$
      .pipe(
        map(({ edges }) => {
          return edges || {};
        }),
        filter((edges: Edges) => {
          return Object.keys(edges).length > 0;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((edges: Edges) => {
        if (currentResize) {
          removeGhostElement();
        }
        const startingRect: BoundingRectangle = getElementRect(
          this.elm,
          this.ghostElementPositioning,
        );
        currentResize = {
          edges,
          startingRect,
          currentRect: startingRect,
        };
        const resizeCursors = getResizeCursors();
        const cursor = getResizeCursor(currentResize.edges, resizeCursors);
        this.renderer.setStyle(document.body, 'cursor', cursor);
        this.setElementClass(this.elm, RESIZE_ACTIVE_CLASS, true);
        if (this.enableGhostResize) {
          currentResize.clonedNode = deepCloneNode(this.elm.nativeElement);
          this.elm.nativeElement.parentElement.appendChild(
            currentResize.clonedNode,
          );
          this.renderer.setStyle(
            this.elm.nativeElement,
            'visibility',
            'hidden',
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'position',
            this.ghostElementPositioning,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'left',
            `${currentResize.startingRect.left}px`,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'top',
            `${currentResize.startingRect.top}px`,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'height',
            `${currentResize.startingRect.height}px`,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'width',
            `${currentResize.startingRect.width}px`,
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'cursor',
            getResizeCursor(currentResize.edges, resizeCursors),
          );
          this.renderer.addClass(
            currentResize.clonedNode,
            RESIZE_GHOST_ELEMENT_CLASS,
          );
          currentResize.clonedNode!.scrollTop = currentResize.startingRect
            .scrollTop as number;
          currentResize.clonedNode!.scrollLeft = currentResize.startingRect
            .scrollLeft as number;
        }
        if (this.resizeStart.observers.length > 0) {
          this.zone.run(() => {
            this.resizeStart.emit({
              edges: getEdgesDiff({
                edges,
                initialRectangle: startingRect,
                newRectangle: startingRect,
              }),
              rectangle: getNewBoundingRectangle(startingRect, {}, 0, 0),
            });
          });
        }
      });

    mouseup$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (currentResize) {
        this.renderer.removeClass(this.elm.nativeElement, RESIZE_ACTIVE_CLASS);
        this.renderer.setStyle(document.body, 'cursor', '');
        this.renderer.setStyle(this.elm.nativeElement, 'cursor', '');
        if (this.resizeEnd.observers.length > 0) {
          this.zone.run(() => {
            this.resizeEnd.emit({
              edges: getEdgesDiff({
                edges: currentResize!.edges,
                initialRectangle: currentResize!.startingRect,
                newRectangle: currentResize!.currentRect,
              }),
              rectangle: currentResize!.currentRect,
            });
          });
        }
        removeGhostElement();
        currentResize = null;
      }
    });
  }

  /**
   * @hidden
   */
  ngOnDestroy(): void {
    // browser check for angular universal, because it doesn't know what document is
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(document.body, 'cursor', '');
    }
    this.mousedown.complete();
    this.mouseup.complete();
    this.mousemove.complete();
    this.destroy$.next();
  }

  private setElementClass(elm: ElementRef, name: string, add: boolean): void {
    if (add) {
      this.renderer.addClass(elm.nativeElement, name);
    } else {
      this.renderer.removeClass(elm.nativeElement, name);
    }
  }
}

class PointerEventListeners {
  public pointerDown: Observable<PointerEventCoordinate>;

  public pointerMove: Observable<PointerEventCoordinate>;

  public pointerUp: Observable<PointerEventCoordinate>;

  private static instance: PointerEventListeners;

  public static getInstance(
    renderer: Renderer2,
    zone: NgZone,
  ): PointerEventListeners {
    if (!PointerEventListeners.instance) {
      PointerEventListeners.instance = new PointerEventListeners(
        renderer,
        zone,
      );
    }
    return PointerEventListeners.instance;
  }

  constructor(renderer: Renderer2, zone: NgZone) {
    this.pointerDown = new Observable(
      (observer: Observer<PointerEventCoordinate>) => {
        let unsubscribeMouseDown: () => void;
        let unsubscribeTouchStart: (() => void) | undefined;

        zone.runOutsideAngular(() => {
          unsubscribeMouseDown = renderer.listen(
            'document',
            'mousedown',
            (event: MouseEvent) => {
              observer.next({
                clientX: event.clientX,
                clientY: event.clientY,
                event,
              });
            },
          );

          if (IS_TOUCH_DEVICE) {
            unsubscribeTouchStart = renderer.listen(
              'document',
              'touchstart',
              (event: TouchEvent) => {
                observer.next({
                  clientX: event.touches[0].clientX,
                  clientY: event.touches[0].clientY,
                  event,
                });
              },
            );
          }
        });

        return () => {
          unsubscribeMouseDown();
          if (IS_TOUCH_DEVICE) {
            unsubscribeTouchStart!();
          }
        };
      },
    ).pipe(share());

    this.pointerMove = new Observable(
      (observer: Observer<PointerEventCoordinate>) => {
        let unsubscribeMouseMove: () => void;
        let unsubscribeTouchMove: (() => void) | undefined;

        zone.runOutsideAngular(() => {
          unsubscribeMouseMove = renderer.listen(
            'document',
            'mousemove',
            (event: MouseEvent) => {
              observer.next({
                clientX: event.clientX,
                clientY: event.clientY,
                event,
              });
            },
          );

          if (IS_TOUCH_DEVICE) {
            unsubscribeTouchMove = renderer.listen(
              'document',
              'touchmove',
              (event: TouchEvent) => {
                observer.next({
                  clientX: event.targetTouches[0].clientX,
                  clientY: event.targetTouches[0].clientY,
                  event,
                });
              },
            );
          }
        });

        return () => {
          unsubscribeMouseMove();
          if (IS_TOUCH_DEVICE) {
            unsubscribeTouchMove!();
          }
        };
      },
    ).pipe(share());

    this.pointerUp = new Observable(
      (observer: Observer<PointerEventCoordinate>) => {
        let unsubscribeMouseUp: () => void;
        let unsubscribeTouchEnd: (() => void) | undefined;
        let unsubscribeTouchCancel: (() => void) | undefined;

        zone.runOutsideAngular(() => {
          unsubscribeMouseUp = renderer.listen(
            'document',
            'mouseup',
            (event: MouseEvent) => {
              observer.next({
                clientX: event.clientX,
                clientY: event.clientY,
                event,
              });
            },
          );

          if (IS_TOUCH_DEVICE) {
            unsubscribeTouchEnd = renderer.listen(
              'document',
              'touchend',
              (event: TouchEvent) => {
                observer.next({
                  clientX: event.changedTouches[0].clientX,
                  clientY: event.changedTouches[0].clientY,
                  event,
                });
              },
            );

            unsubscribeTouchCancel = renderer.listen(
              'document',
              'touchcancel',
              (event: TouchEvent) => {
                observer.next({
                  clientX: event.changedTouches[0].clientX,
                  clientY: event.changedTouches[0].clientY,
                  event,
                });
              },
            );
          }
        });

        return () => {
          unsubscribeMouseUp();
          if (IS_TOUCH_DEVICE) {
            unsubscribeTouchEnd!();
            unsubscribeTouchCancel!();
          }
        };
      },
    ).pipe(share());
  }
}
