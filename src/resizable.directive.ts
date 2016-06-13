import {
  Directive,
  HostListener,
  Renderer,
  ElementRef,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import {Subject} from 'rxjs';
import {Observable} from 'rxjs/Observable';

export interface Edges {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export interface BoundingRectangle {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height?: number;
  width?: number;
}

export interface ResizeEvent {
  rectangle: BoundingRectangle;
  edges: Edges;
}

const isNumberCloseTo: Function = (value1: number, value2: number, precision: number = 3): boolean => {
  const diff: number = Math.abs(value1 - value2);
  return diff < precision;
};

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

const getResizeEdges: Function = ({mouseX, mouseY, elm}: {mouseX: number, mouseY: number, elm: ElementRef}): Edges => {
  const elmPosition: ClientRect = elm.nativeElement.getBoundingClientRect();
  const edges: Edges = {};
  if (isNumberCloseTo(mouseX, elmPosition.left)) {
    edges.left = true;
  }
  if (isNumberCloseTo(mouseX, elmPosition.right)) {
    edges.right = true;
  }
  if (isNumberCloseTo(mouseY, elmPosition.top)) {
    edges.top = true;
  }
  if (isNumberCloseTo(mouseY, elmPosition.bottom)) {
    edges.bottom = true;
  }
  return edges;
};

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

@Directive({
  selector: '[mwl-resizeable]'
})
export class Resizable implements OnInit {

  @Output() onResizeStart: EventEmitter<Object> = new EventEmitter(false);
  @Output() onResize: EventEmitter<Object> = new EventEmitter(false);
  @Output() onResizeEnd: EventEmitter<Object> = new EventEmitter(false);

  private mouseup: Subject<any> = new Subject();
  private mousedown: Subject<any> = new Subject();
  private mousemove: Subject<any> = new Subject();

  constructor(private renderer: Renderer, private elm: ElementRef) {}

  ngOnInit(): void {

    let currentResize: {
      startCoords: {
        mouseX: number,
        mouseY: number
      },
      edges: Edges,
      startingRect: BoundingRectangle,
      originalStyles: {
        position: string,
        left: string,
        top: string,
        width: string,
        height: string,
        'user-drag': string
      }
    };

    const resetElementStyles: Function = (): void => {
      for (let key in currentResize.originalStyles) {
        const value: string = currentResize.originalStyles[key];
        if (typeof value !== 'undefined') {
          this.renderer.setElementStyle(this.elm.nativeElement, key, currentResize.originalStyles[key]);
        }
      }
    };

    this.mousemove.subscribe(({mouseX, mouseY}) => {

      const resizeEdges: Edges = getResizeEdges({mouseX, mouseY, elm: this.elm});
      const cursor: string = getResizeCursor(resizeEdges);
      this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', cursor);

    });

    const mousedrag: Observable<any> = this.mousedown.flatMap(startCoords => {
      return this.mousemove.map(moveCoords => {
        return {
          mouseX: moveCoords.mouseX - startCoords.mouseX,
          mouseY: moveCoords.mouseY - startCoords.mouseY
        };
      });
    });

    mousedrag.subscribe(({mouseX, mouseY}) => {
      if (currentResize) {

        const newBoundingRect: BoundingRectangle = getNewBoundingRectangle(currentResize.startingRect, currentResize.edges, mouseX, mouseY);

        if (newBoundingRect.height > 0 && newBoundingRect.width > 0) {
          this.renderer.setElementStyle(this.elm.nativeElement, 'height', `${newBoundingRect.height}px`);
          this.renderer.setElementStyle(this.elm.nativeElement, 'width', `${newBoundingRect.width}px`);
          this.renderer.setElementStyle(this.elm.nativeElement, 'top', `${newBoundingRect.top}px`);
          this.renderer.setElementStyle(this.elm.nativeElement, 'left', `${newBoundingRect.left}px`);
        }

        this.onResize.emit({
          edges: currentResize.edges,
          rectangle: newBoundingRect
        });

      }
    });

    this.mousedown.subscribe(({mouseX, mouseY}) => {
      const edges: Edges = getResizeEdges({mouseX, mouseY, elm: this.elm});
      if (Object.keys(edges).length > 0) {
        if (currentResize) {
          resetElementStyles();
        }
        const startingRect: BoundingRectangle = this.elm.nativeElement.getBoundingClientRect();
        currentResize = {
          startCoords: {
            mouseX,
            mouseY
          },
          edges,
          startingRect,
          originalStyles: {
            position: this.elm.nativeElement.style.position,
            left: this.elm.nativeElement.style.left,
            top: this.elm.nativeElement.style.top,
            width: `${startingRect.width}px`,
            height: `${startingRect.height}px`,
            'user-drag': this.elm.nativeElement.style['user-drag']
          }
        };
        this.renderer.setElementStyle(this.elm.nativeElement, 'position', 'fixed');
        this.renderer.setElementStyle(this.elm.nativeElement, 'left', `${currentResize.startingRect.left}px`);
        this.renderer.setElementStyle(this.elm.nativeElement, 'top', `${currentResize.startingRect.top}px`);
        this.renderer.setElementStyle(this.elm.nativeElement, 'user-drag', 'none');
        this.onResizeStart.emit({
          edges,
          rectangle: startingRect
        });
      }
    });

    this.mouseup.subscribe(({mouseX, mouseY}) => {
      if (currentResize) {
        this.onResizeEnd.emit({
          edges: currentResize.edges,
          rectangle: getNewBoundingRectangle(
            currentResize.startingRect,
            currentResize.edges,
            mouseX - currentResize.startCoords.mouseX,
            mouseY - currentResize.startCoords.mouseY
          )
        });
        resetElementStyles();
        currentResize = null;
      }
    });

  }

  @HostListener('document:mouseup', ['$event.clientX', '$event.clientY'])
  private onMouseup(mouseX: number, mouseY: number): void {
    this.mouseup.next({mouseX, mouseY});
  }

  @HostListener('document:mousedown', ['$event.clientX', '$event.clientY'])
  private onMousedown(mouseX: number, mouseY: number): void {
    this.mousedown.next({mouseX, mouseY});
  }

  @HostListener('document:mousemove', ['$event.clientX', '$event.clientY'])
  private onMousemove(mouseX: number, mouseY: number): void {
    this.mousemove.next({mouseX, mouseY});
  }

}
