import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'mwl-demo',
  styles: [
    `
      .rectangle {
        position: relative;
        top: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 300px;
        height: 150px;
        background-color: #fd4140;
        border: solid 1px #121621;
        color: #121621;
        margin: auto;
        box-sizing: border-box; // required for the enableGhostResize option to work
      }

      canvas {
        width: 150px;
        height: 100px;
      }

      .resize-handle-top,
      .resize-handle-bottom {
        position: absolute;
        height: 5px;
        cursor: row-resize;
        width: 100%;
      }

      .resize-handle-top {
        top: 0;
      }

      .resize-handle-bottom {
        bottom: 0;
      }

      .resize-handle-left,
      .resize-handle-right {
        position: absolute;
        height: 100%;
        cursor: col-resize;
        width: 5px;
      }

      .resize-handle-left {
        left: 0;
      }

      .resize-handle-right {
        right: 0;
      }
    `,
  ],
  template: `
    <div class="text-center">
      <h1>Drag and pull the edges of the rectangle</h1>
      <div
        class="rectangle"
        [ngStyle]="style"
        mwlResizable
        [validateResize]="validate"
        [enableGhostResize]="true"
        [resizeSnapGrid]="{ left: 50, right: 50 }"
        (resizeEnd)="onResizeEnd($event)"
      >
        <div>HTML text example</div>
        <canvas #canvas></canvas>
        <div
          class="resize-handle-top"
          mwlResizeHandle
          [resizeEdges]="{ top: true }"
        ></div>
        <div
          class="resize-handle-left"
          mwlResizeHandle
          [resizeEdges]="{ left: true }"
        ></div>
        <div
          class="resize-handle-right"
          mwlResizeHandle
          [resizeEdges]="{ right: true }"
        ></div>
        <div
          class="resize-handle-bottom"
          mwlResizeHandle
          [resizeEdges]="{ bottom: true }"
        ></div>
      </div>
    </div>
  `,
})
export class DemoComponent implements AfterViewInit {
  @ViewChild('canvas')
  public canvas: ElementRef<HTMLCanvasElement>;

  public style: object = {};

  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 50;
    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < MIN_DIMENSIONS_PX ||
        event.rectangle.height < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: ResizeEvent): void {
    this.style = {
      position: 'fixed',
      left: `${event.rectangle.left}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`,
    };
  }

  drawCanvas(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      ctx.font = '28px serif';
      ctx.fillText('Canvas text example', 50, 50);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 5;
      ctx.strokeRect(30, 10, 260, 60);
    }
  }

  ngAfterViewInit(): void {
    this.drawCanvas();
  }
}
