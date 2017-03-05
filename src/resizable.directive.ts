import {
  Directive,
  HostListener,
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
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/take';
import {ResizeHandle} from './resizeHandle.directive';
import {Edges} from './interfaces/edges.interface';
import {BoundingRectangle} from './interfaces/boundingRectangle.interface';

interface Coordinate {
  x: number;
  y: number;
}

function isNumberCloseTo(value1: number, value2: number, precision: number = 3): boolean {
  const diff: number = Math.abs(value1 - value2);
  return diff < precision;
}

function getNewBoundingRectangle(element: ElementRef, edges: Edges, mouseX: number, mouseY: number,
                                 elementToResizeFixed: boolean): BoundingRectangle {

  const newBoundingRect: BoundingRectangle = getElementRect(element, elementToResizeFixed);

  if (edges.top) {
    newBoundingRect.top += mouseY;
  }
  if (edges.bottom) {
    newBoundingRect.bottom += mouseY;
  }
  if (edges.left) {
    newBoundingRect.left += mouseX;
  }
  if (edges.right) {
    newBoundingRect.right += mouseX;
  }
  newBoundingRect.height = newBoundingRect.bottom - newBoundingRect.top;
  newBoundingRect.width = newBoundingRect.right - newBoundingRect.left;

  return newBoundingRect;

}

function getElementRect(element: ElementRef, elementToResizeFixed: boolean): BoundingRectangle {
  if (elementToResizeFixed) {
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

function isWithinBoundingY({mouseY, rect}: {mouseY: number, rect: ClientRect}): boolean {
  return mouseY >= rect.top && mouseY <= rect.bottom;
}

function isWithinBoundingX({mouseX, rect}: {mouseX: number, rect: ClientRect}): boolean {
  return mouseX >= rect.left && mouseX <= rect.right;
}

function getResizeEdges(
  {mouseX, mouseY, elm, allowedEdges, cursorPrecision}:
    {mouseX: number, mouseY: number, elm: ElementRef, allowedEdges: Edges, cursorPrecision: number}): Edges {
  const elmPosition: ClientRect = elm.nativeElement.getBoundingClientRect();
  const edges: Edges = {};

  if (
    allowedEdges.left &&
    isNumberCloseTo(mouseX, elmPosition.left, cursorPrecision) &&
    isWithinBoundingY({mouseY, rect: elmPosition})
  ) {
    edges.left = true;
  }

  if (
    allowedEdges.right &&
    isNumberCloseTo(mouseX, elmPosition.right, cursorPrecision) &&
    isWithinBoundingY({mouseY, rect: elmPosition})
  ) {
    edges.right = true;
  }

  if (
    allowedEdges.top &&
    isNumberCloseTo(mouseY, elmPosition.top, cursorPrecision) &&
    isWithinBoundingX({mouseX, rect: elmPosition})
  ) {
    edges.top = true;
  }

  if (
    allowedEdges.bottom &&
    isNumberCloseTo(mouseY, elmPosition.bottom, cursorPrecision) &&
    isWithinBoundingX({mouseX, rect: elmPosition})
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
   * If the element have already a position fixed set to true.
   */
  @Input() elementToResizeFixed: boolean = false;

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

  /**
   * @private
   */
  constructor(private renderer: Renderer, public elm: ElementRef, private zone: NgZone) {}

  /**
   * @private
   */
  ngOnInit(): void {

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

    this.mousemove.subscribe(({mouseX, mouseY, event}) => {

      if (currentResize) {
        event.preventDefault();
      }

      const resizeEdges: Edges = getResizeEdges({
        mouseX, mouseY,
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
          mouseX: moveCoords.mouseX - startCoords.mouseX,
          mouseY: moveCoords.mouseY - startCoords.mouseY
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
          x: Math.ceil(coords.mouseX / snapGrid.x),
          y: Math.ceil(coords.mouseY / snapGrid.y)
        };
      };

      return merge(
        this.mousemove.take(1).map(coords => [, coords]),
        this.mousemove.pairwise()
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
          mouseX: Math.round(newCoords.mouseX / snapGrid.x) * snapGrid.x,
          mouseY: Math.round(newCoords.mouseY / snapGrid.y) * snapGrid.y
        };
      }).takeUntil(merge(this.mouseup, this.mousedown));

    }).filter(() => !!currentResize);

    mousedrag.map(({mouseX, mouseY}) => {
      return getNewBoundingRectangle(this.elm, currentResize.edges, mouseX, mouseY, this.elementToResizeFixed);
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

    this.mousedown.map(({mouseX, mouseY, edges}) => {
      return edges || getResizeEdges({
        mouseX, mouseY,
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
      const startingRect: BoundingRectangle = getElementRect(this.elm, this.elementToResizeFixed);
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
        this.renderer.setElementStyle(currentResize.clonedNode, 'position', 'fixed');
        this.renderer.setElementStyle(currentResize.clonedNode, 'left', `${currentResize.startingRect.left}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'top', `${currentResize.startingRect.top}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'height', `${currentResize.startingRect.height}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'width', `${currentResize.startingRect.width}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'cursor', getResizeCursor(currentResize.edges, resizeCursors));
      }
      this.zone.run(() => {
        this.resizeStart.emit({
          edges: getEdgesDiff({edges, initialRectangle: startingRect, newRectangle: startingRect}),
          rectangle: getNewBoundingRectangle(this.elm, {}, 0, 0, this.elementToResizeFixed)
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
  }

  /**
   * @private
   */
  @HostListener('document:touchstart', ['$event.touches[0].clientX', '$event.touches[0].clientY'])
  @HostListener('document:mousedown', ['$event.clientX', '$event.clientY'])
  onMousedown(mouseX: number, mouseY: number): void {
    this.zone.runOutsideAngular(() => {
      this.mousedown.next({mouseX, mouseY});
    });
  }

  /**
   * @private
   */
  @HostListener('document:touchmove', ['$event', '$event.targetTouches[0].clientX', '$event.targetTouches[0].clientY'])
  @HostListener('document:mousemove', ['$event', '$event.clientX', '$event.clientY'])
  onMousemove(event: any, mouseX: number, mouseY: number): void {
    this.zone.runOutsideAngular(() => {
      this.mousemove.next({mouseX, mouseY, event});
    });
  }

  /**
   * @private
   */
  @HostListener('document:touchend', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('document:touchcancel', ['$event.changedTouches[0].clientX', '$event.changedTouches[0].clientY'])
  @HostListener('document:mouseup', ['$event.clientX', '$event.clientY'])
  onMouseup(mouseX: number, mouseY: number): void {
    this.zone.runOutsideAngular(() => {
      this.mouseup.next({mouseX, mouseY});
    });
  }

}
