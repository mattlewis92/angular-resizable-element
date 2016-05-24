import {
  Directive,
  HostListener,
  Renderer,
  ElementRef,
} from '@angular/core';

@Directive({
  selector: '[mwl-resizeable]'
})
export class Resizable {

  constructor(private renderer: Renderer, private elm: ElementRef) {}

  private isNumberCloseTo(value1: number, value2: number, precision: number = 3): boolean {
    const diff = Math.abs(value1 - value2);
    return diff < precision;
  }

  // TODO - refactor this to use more observables like this
  // https://github.com/AngularClass/angular2-examples/blob/master/rx-draggable/directives/draggable.ts
  @HostListener('mousemove', ['$event.clientX', '$event.clientY'])
  private onMouseMove(mouseX: number, mouseY: number): void {
    const elmPosition: ClientRect = this.elm.nativeElement.getBoundingClientRect();
    if (this.isNumberCloseTo(mouseX, elmPosition.left) || this.isNumberCloseTo(mouseX, elmPosition.right)) {
      this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', 'ew-resize');
    } else if (this.isNumberCloseTo(mouseY, elmPosition.top) || this.isNumberCloseTo(mouseY, elmPosition.bottom)) {
      this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', 'ns-resize');
    }  else {
      this.renderer.setElementStyle(this.elm.nativeElement, 'cursor', 'auto');
    }
  }

}
