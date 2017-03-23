import {
  Directive,
  Renderer,
  ElementRef,
  OnInit,
  AfterViewInit,
  Output,
  Input,
  EventEmitter,
  ContentChildren,
  QueryList,
  OnDestroy,
  NgZone
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {interval} from 'rxjs/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/throttle';
import 'rxjs/add/operator/share';
import {ResizeHandle} from './resizeHandle.directive';
import {Edges} from './interfaces/edges.interface';
import {BoundingRectangle} from './interfaces/boundingRectangle.interface';
import {PointerEventListeners} from './pointerEventListeners';

interface Coordinate {
  x: number;
  y: number;
}

function isNumberCloseTo(value1: number, value2: number, precision: number = 3): boolean {
  const diff: number = Math.abs(value1 - value2);
  return diff < precision;
}

function getNewBoundingRectangle(startingRect: BoundingRectangle, edges: Edges, clientX: number, clientY: number): BoundingRectangle {

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

function getElementRect(element: ElementRef, ghostElementPositioning: string): BoundingRectangle {
  if (ghostElementPositioning === 'absolute') {
    return {
      top: element.nativeElement.offsetTop,
      bottom: element.nativeElement.offsetHeight + element.nativeElement.offsetTop,
      left: element.nativeElement.offsetLeft,
      right: element.nativeElement.offsetWidth + element.nativeElement.offsetLeft
    };
  } else {
    const boundingRect: BoundingRectangle = element.nativeElement.getBoundingClientRect();
    return {
      top: boundingRect.top,
      bottom: boundingRect.bottom,
      left: boundingRect.left,
      right: boundingRect.right
    };
  }
}

function isWithinBoundingY({clientY, rect}: {clientY: number, rect: ClientRect}): boolean {
  return clientY >= rect.top && clientY <= rect.bottom;
}

function isWithinBoundingX({clientX, rect}: {clientX: number, rect: ClientRect}): boolean {
  return clientX >= rect.left && clientX <= rect.right;
}

function getResizeEdges(
  {clientX, clientY, elm, allowedEdges, cursorPrecision}:
    {clientX: number, clientY: number, elm: ElementRef, allowedEdges: Edges, cursorPrecision: number}): Edges {
  const elmPosition: ClientRect = elm.nativeElement.getBoundingClientRect();
  const edges: Edges = {};

  if (
    allowedEdges.left &&
    isNumberCloseTo(clientX, elmPosition.left, cursorPrecision) &&
    isWithinBoundingY({clientY, rect: elmPosition})
  ) {
    edges.left = true;
  }

  if (
    allowedEdges.right &&
    isNumberCloseTo(clientX, elmPosition.right, cursorPrecision) &&
    isWithinBoundingY({clientY, rect: elmPosition})
  ) {
    edges.right = true;
  }

  if (
    allowedEdges.top &&
    isNumberCloseTo(clientY, elmPosition.top, cursorPrecision) &&
    isWithinBoundingX({clientX, rect: elmPosition})
  ) {
    edges.top = true;
  }

  if (
    allowedEdges.bottom &&
    isNumberCloseTo(clientY, elmPosition.bottom, cursorPrecision) &&
    isWithinBoundingX({clientX, rect: elmPosition})
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
  leftOrRight: 'ew-resize',
  topOrBottom: 'ns-resize'
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
    return null;
  }
}

function getEdgesDiff(
  {edges, initialRectangle, newRectangle}: {edges: Edges, initialRectangle: BoundingRectangle, newRectangle: BoundingRectangle}): Edges {

  const edgesDiff: Edges = {};
  Object.keys(edges).forEach((edge: string) => {
    edgesDiff[edge] = newRectangle[edge] - initialRectangle[edge];
  });
  return edgesDiff;

}

const RESIZE_ACTIVE_CLASS: string = 'resize-active';
const RESIZE_LEFT_HOVER_CLASS: string = 'resize-left-hover';
const RESIZE_RIGHT_HOVER_CLASS: string = 'resize-right-hover';
const RESIZE_TOP_HOVER_CLASS: string = 'resize-top-hover';
const RESIZE_BOTTOM_HOVER_CLASS: string = 'resize-bottom-hover';

export const MOUSE_MOVE_THROTTLE_MS: number = 50;

/**
 * Place this on an element to make it resizable
 *
 * For example
 *
 * ```
 * &lt;div mwlResizable [resizeEdges]="{bottom: true, right: true, top: true, left: true}" [enableGhostResize]="true"&gt;&lt;/div&gt;
 * ```
 */
@Directive({
  selector: '[mwlResizable]'
})
export class Resizable implements OnInit, OnDestroy, AfterViewInit {

  /**
   * A function that will be called before each resize event. Return `true` to allow the resize event to propagate or `false` to cancel it
   */
  @Input() validateResize: Function;

  /**
   * The edges that an element can be resized from. Pass an object like `{top: true, bottom: false}`. By default no edges can be resized.
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
   */
  @Input() resizeCursorPrecision: number = 3;

  /**
   * Define the positioning of the ghost element (can be fixed or absolute)
   */
  @Input() ghostElementPositioning: 'fixed' | 'absolute' = 'fixed';

  /**
   * Called when the mouse is pressed and a resize event is about to begin. `$event` is a `ResizeEvent` object.
   */
  @Output() resizeStart: EventEmitter<Object> = new EventEmitter(false);

  /**
   * Called as the mouse is dragged after a resize event has begun. `$event` is a `ResizeEvent` object.
   */
  @Output() resizing: EventEmitter<Object> = new EventEmitter(false);

  /**
   * Called after the mouse is released after a resize event. `$event` is a `ResizeEvent` object.
   */
  @Output() resizeEnd: EventEmitter<Object> = new EventEmitter(false);

  /**
   * @private
   */
  public mouseup: Subject<any> = new Subject();

  /**
   * @private
   */
  public mousedown: Subject<any> = new Subject();

  /**
   * @private
   */
  public mousemove: Subject<any> = new Subject();

  /**
   * @private
   */
  @ContentChildren(ResizeHandle) resizeHandles: QueryList<ResizeHandle>;

  private pointerEventListeners: PointerEventListeners;

  private pointerEventListenerSubscriptions: any = {};

  /**
   * @private
   */
  constructor(
    private renderer: Renderer,
    public elm: ElementRef,
    private zone: NgZone
  ) {
    this.pointerEventListeners = PointerEventListeners.getInstance(renderer, zone);
  }

  /**
   * @private
   */
  ngOnInit(): void {

    // TODO - use some fancy Observable.merge's for this
    this.pointerEventListenerSubscriptions.pointerDown = this.pointerEventListeners.pointerDown.subscribe(({clientX, clientY}) => {
      this.mousedown.next({clientX, clientY});
    });

    this.pointerEventListenerSubscriptions.pointerMove = this.pointerEventListeners.pointerMove.subscribe(({clientX, clientY, event}) => {
      this.mousemove.next({clientX, clientY, event});
    });

    this.pointerEventListenerSubscriptions.pointerUp =  this.pointerEventListeners.pointerUp.subscribe(({clientX, clientY}) => {
      this.mouseup.next({clientX, clientY});
    });

    let currentResize: {
      edges: Edges,
      startingRect: BoundingRectangle,
      currentRect: BoundingRectangle,
      clonedNode?: HTMLElement
    };

    const removeGhostElement: Function = (): void => {
      if (currentResize.clonedNode) {
        this.elm.nativeElement.parentElement.removeChild(currentResize.clonedNode);
        this.renderer.setElementStyle(this.elm.nativeElement, 'visibility', 'inherit');
      }
    };

    const mouseMove: Observable<any> = this.mousemove.share();

    mouseMove
      .filter(() => !!currentResize)
      .subscribe(({event}) => {
        event.preventDefault();
      });

    mouseMove.throttle(val => interval(MOUSE_MOVE_THROTTLE_MS)).subscribe(({clientX, clientY}) => {

      const resizeEdges: Edges = getResizeEdges({
        clientX, clientY,
        elm: this.elm,
        allowedEdges: this.resizeEdges,
        cursorPrecision: this.resizeCursorPrecision
      });
      const resizeCursors: ResizeCursors = Object.assign({}, DEFAULT_RESIZE_CURSORS, this.resizeCursors);
      const cursor: string = currentResize ? null : getResizeCursor(resizeEdges, resizeCursors);

      this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', cursor);
      this.renderer.setElementClass(this.elm.nativeElement, RESIZE_ACTIVE_CLASS, !!currentResize);
      this.renderer.setElementClass(this.elm.nativeElement, RESIZE_LEFT_HOVER_CLASS, resizeEdges.left === true);
      this.renderer.setElementClass(this.elm.nativeElement, RESIZE_RIGHT_HOVER_CLASS, resizeEdges.right === true);
      this.renderer.setElementClass(this.elm.nativeElement, RESIZE_TOP_HOVER_CLASS, resizeEdges.top === true);
      this.renderer.setElementClass(this.elm.nativeElement, RESIZE_BOTTOM_HOVER_CLASS, resizeEdges.bottom === true);

    });

    const mousedrag: Observable<any> = this.mousedown.flatMap(startCoords => {

      const getDiff: Function = moveCoords => {
        return {
          clientX: moveCoords.clientX - startCoords.clientX,
          clientY: moveCoords.clientY - startCoords.clientY
        };
      };

      const getSnapGrid: Function = () => {
        const snapGrid: Coordinate = {x: 1, y: 1};

        if (currentResize) {
          if (this.resizeSnapGrid.left && currentResize.edges.left) {
            snapGrid.x = +this.resizeSnapGrid.left;
          } else if (this.resizeSnapGrid.right && currentResize.edges.right) {
            snapGrid.x = +this.resizeSnapGrid.right;
          }

          if (this.resizeSnapGrid.top && currentResize.edges.top) {
            snapGrid.y = +this.resizeSnapGrid.top;
          } else if (this.resizeSnapGrid.bottom && currentResize.edges.bottom) {
            snapGrid.y = +this.resizeSnapGrid.bottom;
          }
        }

        return snapGrid;
      };

      const getGrid: Function = (coords, snapGrid) => {
        return {
          x: Math.ceil(coords.clientX / snapGrid.x),
          y: Math.ceil(coords.clientY / snapGrid.y)
        };
      };

      return merge(
        mouseMove.take(1).map(coords => [, coords]),
        mouseMove.pairwise()
      ).map(([previousCoords, newCoords]) => {
        return [previousCoords ? getDiff(previousCoords) : previousCoords, getDiff(newCoords)];
      }).filter(([previousCoords, newCoords]) => {

        if (!previousCoords) {
          return true;
        }

        const snapGrid: Coordinate = getSnapGrid();
        const previousGrid: Coordinate = getGrid(previousCoords, snapGrid);
        const newGrid: Coordinate = getGrid(newCoords, snapGrid);

        return (previousGrid.x !== newGrid.x || previousGrid.y !== newGrid.y);

      }).map(([, newCoords]) => {
        const snapGrid: Coordinate = getSnapGrid();
        return {
          clientX: Math.round(newCoords.clientX / snapGrid.x) * snapGrid.x,
          clientY: Math.round(newCoords.clientY / snapGrid.y) * snapGrid.y
        };
      }).takeUntil(merge(this.mouseup, this.mousedown));

    }).filter(() => !!currentResize);

    mousedrag.map(({clientX, clientY}) => {
      return getNewBoundingRectangle(currentResize.startingRect, currentResize.edges, clientX, clientY);
    }).filter((newBoundingRect: BoundingRectangle) => {
      return newBoundingRect.height > 0 && newBoundingRect.width > 0;
    }).filter((newBoundingRect: BoundingRectangle) => {
      return this.validateResize ? this.validateResize({
        rectangle: newBoundingRect,
        edges: getEdgesDiff({
          edges: currentResize.edges,
          initialRectangle: currentResize.startingRect,
          newRectangle: newBoundingRect
        })
      }) : true;
    }).subscribe((newBoundingRect: BoundingRectangle) => {

      if (currentResize.clonedNode) {
        this.renderer.setElementStyle(currentResize.clonedNode, 'height', `${newBoundingRect.height}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'width', `${newBoundingRect.width}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'top', `${newBoundingRect.top}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'left', `${newBoundingRect.left}px`);
      }

      this.zone.run(() => {
        this.resizing.emit({
          edges: getEdgesDiff({
            edges: currentResize.edges,
            initialRectangle: currentResize.startingRect,
            newRectangle: newBoundingRect
          }),
          rectangle: newBoundingRect
        });
      });

      currentResize.currentRect = newBoundingRect;

    });

    this.mousedown.map(({clientX, clientY, edges}) => {
      return edges || getResizeEdges({
        clientX, clientY,
        elm: this.elm,
        allowedEdges: this.resizeEdges,
        cursorPrecision: this.resizeCursorPrecision
      });
    }).filter((edges: Edges) => {
      return Object.keys(edges).length > 0;
    }).subscribe((edges: Edges) => {
      if (currentResize) {
        removeGhostElement();
      }
      const startingRect: BoundingRectangle = getElementRect(this.elm, this.ghostElementPositioning);
      currentResize = {
        edges,
        startingRect,
        currentRect: startingRect
      };
      if (this.enableGhostResize) {
        currentResize.clonedNode = this.elm.nativeElement.cloneNode(true);
        const resizeCursors: ResizeCursors = Object.assign({}, DEFAULT_RESIZE_CURSORS, this.resizeCursors);
        this.elm.nativeElement.parentElement.appendChild(currentResize.clonedNode);
        this.renderer.setElementStyle(this.elm.nativeElement, 'visibility', 'hidden');
        this.renderer.setElementStyle(currentResize.clonedNode, 'position', this.ghostElementPositioning);
        this.renderer.setElementStyle(currentResize.clonedNode, 'left', `${currentResize.startingRect.left}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'top', `${currentResize.startingRect.top}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'height', `${currentResize.startingRect.height}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'width', `${currentResize.startingRect.width}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'cursor', getResizeCursor(currentResize.edges, resizeCursors));
      }
      this.zone.run(() => {
        this.resizeStart.emit({
          edges: getEdgesDiff({edges, initialRectangle: startingRect, newRectangle: startingRect}),
          rectangle: getNewBoundingRectangle(startingRect, {}, 0, 0)
        });
      });
    });

    this.mouseup.subscribe(() => {
      if (currentResize) {
        this.renderer.setElementClass(this.elm.nativeElement, RESIZE_ACTIVE_CLASS, false);
        this.zone.run(() => {
          this.resizeEnd.emit({
            edges: getEdgesDiff({
              edges: currentResize.edges,
              initialRectangle: currentResize.startingRect,
              newRectangle: currentResize.currentRect
            }),
            rectangle: currentResize.currentRect
          });
        });
        removeGhostElement();
        currentResize = null;
      }
    });

  }

  /**
   * @private
   */
  ngAfterViewInit(): void {
    this.resizeHandles.forEach((handle: ResizeHandle) => {
      handle.resizable = this;
    });
  }

  /**
   * @private
   */
  ngOnDestroy(): void {
    this.mousedown.complete();
    this.mouseup.complete();
    this.mousemove.complete();
    this.pointerEventListenerSubscriptions.pointerDown.unsubscribe();
    this.pointerEventListenerSubscriptions.pointerMove.unsubscribe();
    this.pointerEventListenerSubscriptions.pointerUp.unsubscribe();
  }

}
