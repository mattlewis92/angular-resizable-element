import {
  Directive,
  HostListener,
  Renderer,
  ElementRef,
  OnInit
} from '@angular/core';
import {Subject} from 'rxjs';
import {Observable} from 'rxjs/Observable';

const isNumberCloseTo: Function = (value1: number, value2: number, precision: number = 3): boolean => {
  const diff: number = Math.abs(value1 - value2);
  return diff < precision;
};

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

@Directive({
  selector: '[mwl-resizeable]'
})
export class Resizable implements OnInit {

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

        const newBoundingRect: BoundingRectangle = {
          top: currentResize.startingRect.top,
          bottom: currentResize.startingRect.bottom,
          left: currentResize.startingRect.left,
          right: currentResize.startingRect.right
        };

        if (currentResize.edges.top) {
          newBoundingRect.top += mouseY;
        }
        if (currentResize.edges.bottom) {
          newBoundingRect.bottom += mouseY;
        }
        if (currentResize.edges.left) {
          newBoundingRect.left += mouseX;
        }
        if (currentResize.edges.right) {
          newBoundingRect.right += mouseX;
        }
        newBoundingRect.height = newBoundingRect.bottom - newBoundingRect.top;
        newBoundingRect.width = newBoundingRect.right - newBoundingRect.left;

        let translateY: number = (newBoundingRect.top - currentResize.startingRect.top);
        let translateX: number = (newBoundingRect.left - currentResize.startingRect.left);

        if (currentResize.previousTranslate) {
          translateX += +currentResize.previousTranslate.translateX;
          translateY += +currentResize.previousTranslate.translateY;
        }

        if (currentResize.edges.right) {
          translateX += (mouseX / 2);
        } else if (currentResize.edges.left) {
          translateX -= (mouseX / 2);
        }

        if (newBoundingRect.height > 0 && newBoundingRect.width > 0) {
          this.renderer.setElementStyle(this.elm.nativeElement, 'height', newBoundingRect.height + 'px');
          this.renderer.setElementStyle(this.elm.nativeElement, 'width', newBoundingRect.width + 'px');
          this.renderer.setElementStyle(this.elm.nativeElement, 'transform', `translate(${translateX}px, ${translateY}px)`);
        }

      }
    });

    this.mousedown.subscribe(({mouseX, mouseY}) => {
      const resizeEdges: Edges = this.getResizeEdges({mouseX, mouseY});
      if (Object.keys(resizeEdges).length > 0) {
        let previousTranslate: any;
        const transform: string = this.elm.nativeElement.style.transform;
        if (transform) {
          const [, translateX, translateY]: any = transform.match(/translate\((.+)px, (.+)px\)/);
          previousTranslate = {
            translateX,
            translateY
          };
        }
        currentResize = {
          edges: resizeEdges,
          startingRect: this.elm.nativeElement.getBoundingClientRect(),
          previousTranslate
        };
        console.log('resize started', currentResize);
      }
    });

    this.mouseup.subscribe(() => {
      if (currentResize) {
        console.log('resize ended');
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
