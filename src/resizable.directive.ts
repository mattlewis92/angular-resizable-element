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

interface Edges {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

interface BoundingRectangle {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height?: number;
  width?: number;
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

@Directive({
  selector: '[mwl-resizeable]'
})
export class Resizable implements OnInit {

  @Output() onResizeStart: EventEmitter<Object> = new EventEmitter();
  @Output() onResize: EventEmitter<Object> = new EventEmitter();
  @Output() onResizeEnd: EventEmitter<Object> = new EventEmitter();

  private mouseup: Subject<any> = new Subject();
  private mousedown: Subject<any> = new Subject();
  private mousemove: Subject<any> = new Subject();

  constructor(private renderer: Renderer, private elm: ElementRef) {}

  ngOnInit(): void {

    let currentResize: any;

    this.mousemove.subscribe(({mouseX, mouseY}) => {

      const resizeEdges: Edges = this.getResizeEdges({mouseX, mouseY});
      if (resizeEdges.left || resizeEdges.right) {
        this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', 'ew-resize');
      } else if (resizeEdges.top || resizeEdges.bottom) {
        this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', 'ns-resize');
      }  else {
        this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', 'auto');
      }

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

        let translateY: number = (newBoundingRect.top - currentResize.startingRect.top);
        let translateX: number = (newBoundingRect.left - currentResize.startingRect.left);

        if (newBoundingRect.height > 0 && newBoundingRect.width > 0) {
          this.renderer.setElementStyle(this.elm.nativeElement, 'height', `${newBoundingRect.height}px`);
          this.renderer.setElementStyle(this.elm.nativeElement, 'width', `${newBoundingRect.width}px`);
          this.renderer.setElementStyle(this.elm.nativeElement, 'transform', `translate(${translateX}px, ${translateY}px)`);
        }

        this.onResize.emit({
          edges: currentResize.edges,
          rectangle: newBoundingRect
        });

      }
    });

    const resetElementStyles: Function = (): void => {
      for (let key in currentResize.originalStyles) {
        const value: string = currentResize.originalStyles[key];
        if (typeof value !== 'undefined') {
          this.renderer.setElementStyle(this.elm.nativeElement, key, currentResize.originalStyles[key]);
        }
      }
    };

    this.mousedown.subscribe(({mouseX, mouseY}) => {
      const resizeEdges: Edges = this.getResizeEdges({mouseX, mouseY});
      if (Object.keys(resizeEdges).length > 0) {
        if (currentResize) {
          resetElementStyles();
        }
        const startingRect: BoundingRectangle = this.elm.nativeElement.getBoundingClientRect();
        currentResize = {
          startCoords: {
            mouseX,
            mouseY
          },
          edges: resizeEdges,
          startingRect,
          originalStyles: {
            position: this.elm.nativeElement.style.position,
            left: this.elm.nativeElement.style.left,
            top: this.elm.nativeElement.style.top,
            transform: this.elm.nativeElement.style.transform,
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
          edges: resizeEdges,
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

  private getResizeEdges({mouseX, mouseY}: any): Edges {

    const elmPosition: ClientRect = this.elm.nativeElement.getBoundingClientRect();
    if (isNumberCloseTo(mouseX, elmPosition.left)) {
      return {left: true};
    } if (isNumberCloseTo(mouseX, elmPosition.right)) {
      return {right: true};
    } if (isNumberCloseTo(mouseY, elmPosition.top)) {
      return {top: true};
    } if (isNumberCloseTo(mouseY, elmPosition.bottom)) {
      return {bottom: true};
    } else {
      return {};
    }

  }

}
