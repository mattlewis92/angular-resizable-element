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
  OnChanges,
  SimpleChanges,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable, Observer, merge, EMPTY } from 'rxjs';
import {
  map,
  mergeMap,
  takeUntil,
  filter,
  pairwise,
  take,
  share,
  auditTime,
  switchMap,
  startWith,
  tap
} from 'rxjs/operators';
import { Edges } from './interfaces/edges.interface';
import { BoundingRectangle } from './interfaces/bounding-rectangle.interface';
import { ResizeEvent } from './interfaces/resize-event.interface';

interface PointerEventCoordinate {
  clientX: number;
  clientY: number;
  event: MouseEvent | TouchEvent;
}

interface Coordinate {
  x: number;
  y: number;
}

function isNumberCloseTo(
  value1: number,
  value2: number,
  precision: number = 3
): boolean {
  const diff: number = Math.abs(value1 - value2);
  return diff < precision;
}

function getNewBoundingRectangle(
  startingRect: BoundingRectangle,
  edges: Edges,
  clientX: number,
  clientY: number
): BoundingRectangle {
  const newBoundingRect: BoundingRectangle = {
    top: startingRect.top,
    bottom: startingRect.bottom,
    left: startingRect.left,
    right: startingRect.right
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
  ghostElementPositioning: string
): BoundingRectangle {
  let translateX = 0;
  let translateY = 0;
  const style = element.nativeElement.style;
  const transformProperties = [
    'transform',
    '-ms-transform',
    '-moz-transform',
    '-o-transform'
  ];
  const transform = transformProperties
    .map(property => style[property])
    .find(value => !!value);
  if (transform && transform.includes('translate')) {
    translateX = transform.match(/translate3?d?\(\s*([^ ,]+)\s*,\s*([^ ,]+)\s*(,\s*([^ )]+)\s*)?\)/)[1];
    translateY = transform.match(/translate3?d?\(\s*([^ ,]+)\s*,\s*([^ ,]+)\s*(,\s*([^ )]+)\s*)?\)/)[2];
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
        translateX
    };
  } else {
    const boundingRect: BoundingRectangle = element.nativeElement.getBoundingClientRect();
    return {
      height: boundingRect.height,
      width: boundingRect.width,
      top: boundingRect.top - translateY,
      bottom: boundingRect.bottom - translateY,
      left: boundingRect.left - translateX,
      right: boundingRect.right - translateX,
      scrollTop: element.nativeElement.scrollTop,
      scrollLeft: element.nativeElement.scrollLeft
    };
  }
}

function isWithinBoundingY({
  clientY,
  rect
}: {
  clientY: number;
  rect: ClientRect;
}): boolean {
  return clientY >= rect.top && clientY <= rect.bottom;
}

function isWithinBoundingX({
  clientX,
  rect
}: {
  clientX: number;
  rect: ClientRect;
}): boolean {
  return clientX >= rect.left && clientX <= rect.right;
}

function getResizeEdges({
  clientX,
  clientY,
  elm,
  allowedEdges,
  cursorPrecision
}: {
  clientX: number;
  clientY: number;
  elm: ElementRef;
  allowedEdges: Edges;
  cursorPrecision: number;
}): Edges {
  const elmPosition: ClientRect = elm.nativeElement.getBoundingClientRect();
  const edges: Edges = {};

  if (
    allowedEdges.left &&
    isNumberCloseTo(clientX, elmPosition.left, cursorPrecision) &&
    isWithinBoundingY({ clientY, rect: elmPosition })
  ) {
    edges.left = true;
  }

  if (
    allowedEdges.right &&
    isNumberCloseTo(clientX, elmPosition.right, cursorPrecision) &&
    isWithinBoundingY({ clientY, rect: elmPosition })
  ) {
    edges.right = true;
  }

  if (
    allowedEdges.top &&
    isNumberCloseTo(clientY, elmPosition.top, cursorPrecision) &&
    isWithinBoundingX({ clientX, rect: elmPosition })
  ) {
    edges.top = true;
  }

  if (
    allowedEdges.bottom &&
    isNumberCloseTo(clientY, elmPosition.bottom, cursorPrecision) &&
    isWithinBoundingX({ clientX, rect: elmPosition })
  ) {
    edges.bottom = true;
  }

  return edges;
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
  topOrBottom: 'row-resize'
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
  newRectangle
}: {
  edges: Edges;
  initialRectangle: BoundingRectangle;
  newRectangle: BoundingRectangle;
}): Edges {
  const edgesDiff: Edges = {};
  Object.keys(edges).forEach(edge => {
    edgesDiff[edge] = (newRectangle[edge] || 0) - (initialRectangle[edge] || 0);
  });
  return edgesDiff;
}

const RESIZE_ACTIVE_CLASS: string = 'resize-active';
const RESIZE_LEFT_HOVER_CLASS: string = 'resize-left-hover';
const RESIZE_RIGHT_HOVER_CLASS: string = 'resize-right-hover';
const RESIZE_TOP_HOVER_CLASS: string = 'resize-top-hover';
const RESIZE_BOTTOM_HOVER_CLASS: string = 'resize-bottom-hover';
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
 */
@Directive({
  selector: '[mwlResizable]'
})
export class ResizableDirective implements OnInit, OnChanges, OnDestroy {
  /**
   * A function that will be called before each resize event. Return `true` to allow the resize event to propagate or `false` to cancel it
   */
  @Input() validateResize: (resizeEvent: ResizeEvent) => boolean;

  /**
   * The edges that an element can be resized from. Pass an object like `{top: true, bottom: false}`. By default no edges can be resized.
   * @deprecated use a resize handle instead that positions itself to the side of the element you would like to resize
   */
  @Input() resizeEdges: Edges = {};

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
  @Input() resizeCursors: ResizeCursors = DEFAULT_RESIZE_CURSORS;

  /**
   * Mouse over thickness to active cursor.
   * @deprecated invalid when you migrate to use resize handles instead of setting resizeEdges on the element
   */
  @Input() resizeCursorPrecision: number = 3;

  /**
   * Define the positioning of the ghost element (can be fixed or absolute)
   */
  @Input() ghostElementPositioning: 'fixed' | 'absolute' = 'fixed';

  /**
   * Allow elements to be resized to negative dimensions
   */
  @Input() allowNegativeResizes: boolean = false;

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

  private resizeEdges$ = new Subject<Edges>();

  /**
   * @hidden
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private renderer: Renderer2,
    public elm: ElementRef,
    private zone: NgZone
  ) {
    this.pointerEventListeners = PointerEventListeners.getInstance(
      renderer,
      zone
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
      this.mousemove
    ).pipe(
      tap(({ event }) => {
        if (currentResize) {
          event.preventDefault();
        }
      }),
      share()
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
          currentResize.clonedNode
        );
        this.renderer.setStyle(this.elm.nativeElement, 'visibility', 'inherit');
      }
    };

    const getResizeCursors = (): ResizeCursors => {
      return {
        ...DEFAULT_RESIZE_CURSORS,
        ...this.resizeCursors
      };
    };

    this.resizeEdges$
      .pipe(
        startWith(this.resizeEdges),
        map(() => {
          return (
            this.resizeEdges &&
            Object.keys(this.resizeEdges).some(edge => !!this.resizeEdges[edge])
          );
        }),
        switchMap(legacyResizeEdgesEnabled =>
          legacyResizeEdgesEnabled ? mousemove$ : EMPTY
        ),
        auditTime(MOUSE_MOVE_THROTTLE_MS),
        takeUntil(this.destroy$)
      )
      .subscribe(({ clientX, clientY }) => {
        const resizeEdges: Edges = getResizeEdges({
          clientX,
          clientY,
          elm: this.elm,
          allowedEdges: this.resizeEdges,
          cursorPrecision: this.resizeCursorPrecision
        });
        const resizeCursors = getResizeCursors();
        if (!currentResize) {
          const cursor = getResizeCursor(resizeEdges, resizeCursors);
          this.renderer.setStyle(this.elm.nativeElement, 'cursor', cursor);
        }
        this.setElementClass(
          this.elm,
          RESIZE_LEFT_HOVER_CLASS,
          resizeEdges.left === true
        );
        this.setElementClass(
          this.elm,
          RESIZE_RIGHT_HOVER_CLASS,
          resizeEdges.right === true
        );
        this.setElementClass(
          this.elm,
          RESIZE_TOP_HOVER_CLASS,
          resizeEdges.top === true
        );
        this.setElementClass(
          this.elm,
          RESIZE_BOTTOM_HOVER_CLASS,
          resizeEdges.bottom === true
        );
      });

    const mousedrag: Observable<any> = mousedown$
      .pipe(
        mergeMap(startCoords => {
          function getDiff(moveCoords: { clientX: number; clientY: number }) {
            return {
              clientX: moveCoords.clientX - startCoords.clientX,
              clientY: moveCoords.clientY - startCoords.clientY
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
            snapGrid: Coordinate
          ) {
            return {
              x: Math.ceil(coords.clientX / snapGrid.x),
              y: Math.ceil(coords.clientY / snapGrid.y)
            };
          }

          return (merge(
            mousemove$.pipe(take(1)).pipe(map(coords => [, coords])),
            mousemove$.pipe(pairwise())
          ) as Observable<
            [
              { clientX: number; clientY: number },
              { clientX: number; clientY: number }
            ]
          >)
            .pipe(
              map(([previousCoords, newCoords]) => {
                return [
                  previousCoords ? getDiff(previousCoords) : previousCoords,
                  getDiff(newCoords)
                ];
              })
            )
            .pipe(
              filter(([previousCoords, newCoords]) => {
                if (!previousCoords) {
                  return true;
                }

                const snapGrid: Coordinate = getSnapGrid();
                const previousGrid: Coordinate = getGrid(
                  previousCoords,
                  snapGrid
                );
                const newGrid: Coordinate = getGrid(newCoords, snapGrid);

                return (
                  previousGrid.x !== newGrid.x || previousGrid.y !== newGrid.y
                );
              })
            )
            .pipe(
              map(([, newCoords]) => {
                const snapGrid: Coordinate = getSnapGrid();
                return {
                  clientX:
                    Math.round(newCoords.clientX / snapGrid.x) * snapGrid.x,
                  clientY:
                    Math.round(newCoords.clientY / snapGrid.y) * snapGrid.y
                };
              })
            )
            .pipe(takeUntil(merge(mouseup$, mousedown$)));
        })
      )
      .pipe(filter(() => !!currentResize));

    mousedrag
      .pipe(
        map(({ clientX, clientY }) => {
          return getNewBoundingRectangle(
            currentResize!.startingRect,
            currentResize!.edges,
            clientX,
            clientY
          );
        })
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
        })
      )
      .pipe(
        filter((newBoundingRect: BoundingRectangle) => {
          return this.validateResize
            ? this.validateResize({
                rectangle: newBoundingRect,
                edges: getEdgesDiff({
                  edges: currentResize!.edges,
                  initialRectangle: currentResize!.startingRect,
                  newRectangle: newBoundingRect
                })
              })
            : true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((newBoundingRect: BoundingRectangle) => {
        if (currentResize && currentResize.clonedNode) {
          this.renderer.setStyle(
            currentResize.clonedNode,
            'height',
            `${newBoundingRect.height}px`
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'width',
            `${newBoundingRect.width}px`
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'top',
            `${newBoundingRect.top}px`
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'left',
            `${newBoundingRect.left}px`
          );
        }

        this.zone.run(() => {
          this.resizing.emit({
            edges: getEdgesDiff({
              edges: currentResize!.edges,
              initialRectangle: currentResize!.startingRect,
              newRectangle: newBoundingRect
            }),
            rectangle: newBoundingRect
          });
        });

        currentResize!.currentRect = newBoundingRect;
      });

    mousedown$
      .pipe(
        map(({ clientX, clientY, edges }) => {
          return (
            edges ||
            getResizeEdges({
              clientX,
              clientY,
              elm: this.elm,
              allowedEdges: this.resizeEdges,
              cursorPrecision: this.resizeCursorPrecision
            })
          );
        })
      )
      .pipe(
        filter((edges: Edges) => {
          return Object.keys(edges).length > 0;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((edges: Edges) => {
        if (currentResize) {
          removeGhostElement();
        }
        const startingRect: BoundingRectangle = getElementRect(
          this.elm,
          this.ghostElementPositioning
        );
        currentResize = {
          edges,
          startingRect,
          currentRect: startingRect
        };
        const resizeCursors = getResizeCursors();
        const cursor = getResizeCursor(currentResize.edges, resizeCursors);
        this.renderer.setStyle(document.body, 'cursor', cursor);
        this.setElementClass(this.elm, RESIZE_ACTIVE_CLASS, true);
        if (this.enableGhostResize) {
          currentResize.clonedNode = this.elm.nativeElement.cloneNode(true);
          this.elm.nativeElement.parentElement.appendChild(
            currentResize.clonedNode
          );
          this.renderer.setStyle(
            this.elm.nativeElement,
            'visibility',
            'hidden'
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'position',
            this.ghostElementPositioning
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'left',
            `${currentResize.startingRect.left}px`
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'top',
            `${currentResize.startingRect.top}px`
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'height',
            `${currentResize.startingRect.height}px`
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'width',
            `${currentResize.startingRect.width}px`
          );
          this.renderer.setStyle(
            currentResize.clonedNode,
            'cursor',
            getResizeCursor(currentResize.edges, resizeCursors)
          );
          this.renderer.addClass(
            currentResize.clonedNode,
            RESIZE_GHOST_ELEMENT_CLASS
          );
          currentResize.clonedNode!.scrollTop = currentResize.startingRect
            .scrollTop as number;
          currentResize.clonedNode!.scrollLeft = currentResize.startingRect
            .scrollLeft as number;
        }
        this.zone.run(() => {
          this.resizeStart.emit({
            edges: getEdgesDiff({
              edges,
              initialRectangle: startingRect,
              newRectangle: startingRect
            }),
            rectangle: getNewBoundingRectangle(startingRect, {}, 0, 0)
          });
        });
      });

    mouseup$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (currentResize) {
        this.renderer.removeClass(this.elm.nativeElement, RESIZE_ACTIVE_CLASS);
        this.renderer.setStyle(document.body, 'cursor', '');
        this.renderer.setStyle(this.elm.nativeElement, 'cursor', '');
        this.zone.run(() => {
          this.resizeEnd.emit({
            edges: getEdgesDiff({
              edges: currentResize!.edges,
              initialRectangle: currentResize!.startingRect,
              newRectangle: currentResize!.currentRect
            }),
            rectangle: currentResize!.currentRect
          });
        });
        removeGhostElement();
        currentResize = null;
      }
    });
  }

  /**
   * @hidden
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.resizeEdges) {
      this.resizeEdges$.next(this.resizeEdges);
    }
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
    this.resizeEdges$.complete();
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

  private static instance: PointerEventListeners; // tslint:disable-line

  public static getInstance(
    renderer: Renderer2,
    zone: NgZone
  ): PointerEventListeners {
    if (!PointerEventListeners.instance) {
      PointerEventListeners.instance = new PointerEventListeners(
        renderer,
        zone
      );
    }
    return PointerEventListeners.instance;
  }

  constructor(renderer: Renderer2, zone: NgZone) {
    this.pointerDown = new Observable(
      (observer: Observer<PointerEventCoordinate>) => {
        let unsubscribeMouseDown: () => void;
        let unsubscribeTouchStart: () => void;

        zone.runOutsideAngular(() => {
          unsubscribeMouseDown = renderer.listen(
            'document',
            'mousedown',
            (event: MouseEvent) => {
              observer.next({
                clientX: event.clientX,
                clientY: event.clientY,
                event
              });
            }
          );

          unsubscribeTouchStart = renderer.listen(
            'document',
            'touchstart',
            (event: TouchEvent) => {
              observer.next({
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY,
                event
              });
            }
          );
        });

        return () => {
          unsubscribeMouseDown();
          unsubscribeTouchStart();
        };
      }
    ).pipe(share());

    this.pointerMove = new Observable(
      (observer: Observer<PointerEventCoordinate>) => {
        let unsubscribeMouseMove: () => void;
        let unsubscribeTouchMove: () => void;

        zone.runOutsideAngular(() => {
          unsubscribeMouseMove = renderer.listen(
            'document',
            'mousemove',
            (event: MouseEvent) => {
              observer.next({
                clientX: event.clientX,
                clientY: event.clientY,
                event
              });
            }
          );

          unsubscribeTouchMove = renderer.listen(
            'document',
            'touchmove',
            (event: TouchEvent) => {
              observer.next({
                clientX: event.targetTouches[0].clientX,
                clientY: event.targetTouches[0].clientY,
                event
              });
            }
          );
        });

        return () => {
          unsubscribeMouseMove();
          unsubscribeTouchMove();
        };
      }
    ).pipe(share());

    this.pointerUp = new Observable(
      (observer: Observer<PointerEventCoordinate>) => {
        let unsubscribeMouseUp: () => void;
        let unsubscribeTouchEnd: () => void;
        let unsubscribeTouchCancel: () => void;

        zone.runOutsideAngular(() => {
          unsubscribeMouseUp = renderer.listen(
            'document',
            'mouseup',
            (event: MouseEvent) => {
              observer.next({
                clientX: event.clientX,
                clientY: event.clientY,
                event
              });
            }
          );

          unsubscribeTouchEnd = renderer.listen(
            'document',
            'touchend',
            (event: TouchEvent) => {
              observer.next({
                clientX: event.changedTouches[0].clientX,
                clientY: event.changedTouches[0].clientY,
                event
              });
            }
          );

          unsubscribeTouchCancel = renderer.listen(
            'document',
            'touchcancel',
            (event: TouchEvent) => {
              observer.next({
                clientX: event.changedTouches[0].clientX,
                clientY: event.changedTouches[0].clientY,
                event
              });
            }
          );
        });

        return () => {
          unsubscribeMouseUp();
          unsubscribeTouchEnd();
          unsubscribeTouchCancel();
        };
      }
    ).pipe(share());
  }
}
