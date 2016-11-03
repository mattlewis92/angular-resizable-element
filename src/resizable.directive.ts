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
  QueryList
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

/**
 * The edges that the resize event were triggered on
 */
export interface Edges {
  top?: boolean | number;
  bottom?: boolean | number;
  left?: boolean | number;
  right?: boolean | number;
}

/**
 * The bounding rectangle of the resized element
 */
export interface BoundingRectangle {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height?: number;
  width?: number;
}

/**
 * The `$event` object that is passed to the resize events
 */
export interface ResizeEvent {
  rectangle: BoundingRectangle;
  edges: Edges;
}

/**
 * @private
 */
interface Coordinate {
  x: number;
  y: number;
}

/**
 * @private
 */
const isNumberCloseTo: Function = (value1: number, value2: number, precision: number = 3): boolean => {
  const diff: number = Math.abs(value1 - value2);
  return diff < precision;
};

/**
 * @private
 */
const getNewBoundingRectangle: Function =
  (startingRect: BoundingRectangle, edges: Edges, mouseX: number, mouseY: number): BoundingRectangle => {

  const newBoundingRect: BoundingRectangle = {
    top: startingRect.top,
    bottom: startingRect.bottom,
    left: startingRect.left,
    right: startingRect.right
  };

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

};

const isWithinBoundingY: Function = ({mouseY, rect}: {mouseY: number, rect: ClientRect}) => {
  return mouseY >= rect.top && mouseY <= rect.bottom;
};

const isWithinBoundingX: Function = ({mouseX, rect}: {mouseX: number, rect: ClientRect}) => {
  return mouseX >= rect.left && mouseX <= rect.right;
};

/**
 * @private
 */
const getResizeEdges: Function = ({mouseX, mouseY, elm, allowedEdges}): Edges => {
  const elmPosition: ClientRect = elm.nativeElement.getBoundingClientRect();
  const edges: Edges = {};
  if (allowedEdges.left && isNumberCloseTo(mouseX, elmPosition.left) && isWithinBoundingY({mouseY, rect: elmPosition})) {
    edges.left = true;
  }
  if (allowedEdges.right && isNumberCloseTo(mouseX, elmPosition.right) && isWithinBoundingY({mouseY, rect: elmPosition})) {
    edges.right = true;
  }
  if (allowedEdges.top && isNumberCloseTo(mouseY, elmPosition.top) && isWithinBoundingX({mouseX, rect: elmPosition})) {
    edges.top = true;
  }
  if (allowedEdges.bottom && isNumberCloseTo(mouseY, elmPosition.bottom) && isWithinBoundingX({mouseX, rect: elmPosition})) {
    edges.bottom = true;
  }
  return edges;
};

/**
 * @private
 */
const getResizeCursor: Function = (edges: Edges): string => {
  if (edges.left && edges.top) {
    return 'nw-resize';
  } else if (edges.right && edges.top) {
    return 'ne-resize';
  } else if (edges.left && edges.bottom) {
    return 'sw-resize';
  } else if (edges.right && edges.bottom) {
    return 'se-resize';
  } else if (edges.left || edges.right) {
    return 'ew-resize';
  } else if (edges.top || edges.bottom) {
    return 'ns-resize';
  } else {
    return 'auto';
  }
};

/**
 * @private
 */
const getEdgesDiff: Function = ({edges, initialRectangle, newRectangle}): Edges => {

  const edgesDiff: Edges = {};
  Object.keys(edges).forEach((edge: string) => {
    edgesDiff[edge] = newRectangle[edge] - initialRectangle[edge];
  });
  return edgesDiff;

};

/**
 * An element placed inside a `mwlResizable` directive to be used as a drag and resize handle
 *
 * For example
 *
 * ```
 * <div mwlResizable>
 *   <div mwlResizeHandle [resizeEdges]="{bottom: true, right: true}"></div>
 * </div>
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
  @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
  private onMouseup(mouseX: number, mouseY: number): void {
    this.resizable.mouseup.next({mouseX, mouseY, edges: this.resizeEdges});
  }

  /**
   * @private
   */
  @HostListener('mousedown', ['$event.clientX', '$event.clientY'])
  private onMousedown(mouseX: number, mouseY: number): void {
    this.resizable.mousedown.next({mouseX, mouseY, edges: this.resizeEdges});
  }

  /**
   * @private
   */
  @HostListener('mousemove', ['$event'])
  private onMousemove(event: MouseEvent): void {
    this.resizable.mousemove.next({mouseX: event.clientX, mouseY: event.clientY, edges: this.resizeEdges, event});
  }

}

/**
 * Place this on an element to make it resizable
 *
 * For example
 *
 * ```
 * <div mwlResizable [resizeEdges]="{bottom: true, right: true, top: true, left: true}" [enableGhostResize]="true"></div>
 * ```
 */
@Directive({
  selector: '[mwlResizable]'
})
export class Resizable implements OnInit, AfterViewInit {

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
  @ContentChildren(ResizeHandle) private resizeHandles: QueryList<ResizeHandle>;

  /**
   * @private
   */
  constructor(private renderer: Renderer, public elm: ElementRef) {}

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

      const resizeEdges: Edges = getResizeEdges({mouseX, mouseY, elm: this.elm, allowedEdges: this.resizeEdges});
      const cursor: string = currentResize ? 'auto' : getResizeCursor(resizeEdges);
      this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', cursor);

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
      return getNewBoundingRectangle(currentResize.startingRect, currentResize.edges, mouseX, mouseY);
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

      this.resizing.emit({
        edges: getEdgesDiff({
          edges: currentResize.edges,
          initialRectangle: currentResize.startingRect,
          newRectangle: newBoundingRect
        }),
        rectangle: newBoundingRect
      });

      currentResize.currentRect = newBoundingRect;

    });

    this.mousedown.map(({mouseX, mouseY, edges}) => {
      return edges || getResizeEdges({mouseX, mouseY, elm: this.elm, allowedEdges: this.resizeEdges});
    }).filter((edges: Edges) => {
      return Object.keys(edges).length > 0;
    }).subscribe((edges: Edges) => {
      if (currentResize) {
        removeGhostElement();
      }
      const startingRect: BoundingRectangle = this.elm.nativeElement.getBoundingClientRect();
      currentResize = {
        edges,
        startingRect,
        currentRect: startingRect
      };
      if (this.enableGhostResize) {
        currentResize.clonedNode = this.elm.nativeElement.cloneNode(true);
        this.elm.nativeElement.parentElement.appendChild(currentResize.clonedNode);
        this.renderer.setElementStyle(this.elm.nativeElement, 'visibility', 'hidden');
        this.renderer.setElementStyle(currentResize.clonedNode, 'position', 'fixed');
        this.renderer.setElementStyle(currentResize.clonedNode, 'left', `${currentResize.startingRect.left}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'top', `${currentResize.startingRect.top}px`);
        this.renderer.setElementStyle(currentResize.clonedNode, 'cursor', 'auto');
      }
      this.resizeStart.emit({
        edges: getEdgesDiff({edges, initialRectangle: startingRect, newRectangle: startingRect}),
        rectangle: getNewBoundingRectangle(startingRect, {}, 0, 0)
      });
    });

    this.mouseup.subscribe(() => {
      if (currentResize) {
        this.resizeEnd.emit({
          edges: getEdgesDiff({
            edges: currentResize.edges,
            initialRectangle: currentResize.startingRect,
            newRectangle: currentResize.currentRect
          }),
          rectangle: currentResize.currentRect
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
  @HostListener('document:mouseup', ['$event.clientX', '$event.clientY'])
  private onMouseup(mouseX: number, mouseY: number): void {
    this.mouseup.next({mouseX, mouseY});
  }

  /**
   * @private
   */
  @HostListener('document:mousedown', ['$event.clientX', '$event.clientY'])
  private onMousedown(mouseX: number, mouseY: number): void {
    this.mousedown.next({mouseX, mouseY});
  }

  /**
   * @private
   */
  @HostListener('document:mousemove', ['$event'])
  private onMousemove(event: MouseEvent): void {
    this.mousemove.next({mouseX: event.clientX, mouseY: event.clientY, event});
  }

}
