import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  MOUSE_MOVE_THROTTLE_MS,
  ResizableDirective,
} from '../lib/resizable.directive';
import { Edges } from '../lib/interfaces/edges.interface';
import { ResizableModule, ResizeEvent } from '../public-api';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'chai';
import * as sinon from 'sinon';

@Component({
  styles: [
    `
      .rectangle {
        position: relative;
        top: 200px;
        left: 100px;
        width: 300px;
        height: 150px;
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
    <div
      class="rectangle"
      [ngStyle]="style"
      mwlResizable
      [validateResize]="validate"
      [enableGhostResize]="enableGhostResize"
      [resizeSnapGrid]="resizeSnapGrid"
      [resizeCursors]="resizeCursors"
      [ghostElementPositioning]="ghostElementPositioning"
      [allowNegativeResizes]="allowNegativeResizes"
      (resizeStart)="resizeStart($event)"
      (resizing)="resizing($event)"
      (resizeEnd)="resizeEnd($event)"
    >
      <div
        *ngIf="resizeEdges.top"
        class="resize-handle-top"
        mwlResizeHandle
        [resizeEdges]="{ top: true }"
      ></div>

      <div
        *ngIf="resizeEdges.left"
        class="resize-handle-left"
        mwlResizeHandle
        [resizeEdges]="{ left: true }"
      ></div>

      <div
        *ngIf="resizeEdges.right"
        class="resize-handle-right"
        mwlResizeHandle
        [resizeEdges]="{ right: true }"
      ></div>

      <div
        *ngIf="resizeEdges.bottom"
        class="resize-handle-bottom"
        mwlResizeHandle
        [resizeEdges]="{ bottom: true }"
      ></div>
    </div>
  `,
})
class TestComponent {
  @ViewChild(ResizableDirective) resizable: ResizableDirective;
  @ViewChild('handle') handle: ElementRef;
  style: object = {};
  resizeStart: sinon.SinonSpy = sinon.spy();
  resizing: sinon.SinonSpy = sinon.spy();
  resizeEnd: sinon.SinonSpy = sinon.spy();
  validate: sinon.SinonStub = sinon.stub().returns(true);
  resizeEdges: Edges = {
    top: true,
    bottom: true,
    left: true,
    right: true,
  };
  enableGhostResize: boolean = true;
  resizeSnapGrid: object = {};
  resizeCursors: object = {};
  ghostElementPositioning: 'fixed' | 'absolute' = 'fixed';
  showResizeHandle = false;
  allowNegativeResizes = false;
}

describe('resizable directive', () => {
  function triggerDomEvent(
    eventType: string,
    target: HTMLElement | Element,
    eventData: object = {}
  ) {
    const event: Event = document.createEvent('Event');
    Object.assign(event, eventData);
    event.initEvent(eventType, true, true);
    target.dispatchEvent(event);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ResizableModule],
      declarations: [TestComponent],
    });
  });

  let component: ComponentFixture<TestComponent>;
  let createComponent: (
    template?: string,
    styles?: string[]
  ) => ComponentFixture<TestComponent>;
  beforeEach(() => {
    document.body.style.margin = '0px';
    createComponent = (template?: string, styles?: string[]) => {
      if (template) {
        TestBed.overrideComponent(TestComponent, { set: { template } });
      }
      if (styles) {
        TestBed.overrideComponent(TestComponent, { set: { styles } });
      }
      const fixture: ComponentFixture<TestComponent> =
        TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      document.body.appendChild(fixture.nativeElement);
      component = fixture;
      return fixture;
    };
  });

  afterEach(() => {
    if (component) {
      component.destroy();
      document.body.innerHTML = '';
    }
  });

  describe('resize events', () => {
    let domEvents: Array<{
      name: string;
      data: { clientX: number; clientY: number };
      style?: Record<string, string>;
    }>;
    let spyName: string;
    let expectedEvent: {
      edges: Record<string, number>;
      rectangle: Record<string, number>;
    };

    it('should emit a starting resize event', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 200,
          },
        },
      ];
      spyName = 'resizeStart';
      expectedEvent = {
        edges: {
          top: 0,
        },
        rectangle: {
          top: 200,
          left: 100,
          width: 300,
          height: 150,
          right: 400,
          bottom: 350,
        },
      };
    });

    it('should emit a resize event whenever the mouse is clicked and dragged', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 200,
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 199,
          },
        },
      ];
      spyName = 'resizing';
      expectedEvent = {
        edges: {
          top: -1,
        },
        rectangle: {
          top: 199,
          left: 100,
          width: 300,
          height: 151,
          right: 400,
          bottom: 350,
        },
      };
    });

    it('should resize from the top', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 200,
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 199,
          },
          style: {
            top: '199px',
            left: '100px',
            width: '300px',
            height: '151px',
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 198,
          },
          style: {
            top: '198px',
            left: '100px',
            width: '300px',
            height: '152px',
          },
        },
        {
          name: 'mouseup',
          data: {
            clientX: 150,
            clientY: 198,
          },
        },
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          top: -2,
        },
        rectangle: {
          top: 198,
          left: 100,
          width: 300,
          height: 152,
          right: 400,
          bottom: 350,
        },
      };
    });

    it('should resize from the left', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 100,
            clientY: 205,
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 99,
            clientY: 205,
          },
          style: {
            top: '200px',
            left: '99px',
            width: '301px',
            height: '150px',
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 98,
            clientY: 205,
          },
          style: {
            top: '200px',
            left: '98px',
            width: '302px',
            height: '150px',
          },
        },
        {
          name: 'mouseup',
          data: {
            clientX: 98,
            clientY: 205,
          },
        },
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          left: -2,
        },
        rectangle: {
          top: 200,
          left: 98,
          width: 302,
          height: 150,
          right: 400,
          bottom: 350,
        },
      };
    });

    it('should resize from the bottom', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 350,
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 351,
          },
          style: {
            top: '200px',
            left: '100px',
            width: '300px',
            height: '151px',
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 352,
          },
          style: {
            top: '200px',
            left: '100px',
            width: '300px',
            height: '152px',
          },
        },
        {
          name: 'mouseup',
          data: {
            clientX: 150,
            clientY: 352,
          },
        },
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          bottom: 2,
        },
        rectangle: {
          top: 200,
          left: 100,
          width: 300,
          height: 152,
          right: 400,
          bottom: 352,
        },
      };
    });

    it('should resize from the right', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 400,
            clientY: 205,
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 401,
            clientY: 205,
          },
          style: {
            top: '200px',
            left: '100px',
            width: '301px',
            height: '150px',
          },
        },
        {
          name: 'mousemove',
          data: {
            clientX: 402,
            clientY: 205,
          },
          style: {
            top: '200px',
            left: '100px',
            width: '302px',
            height: '150px',
          },
        },
        {
          name: 'mouseup',
          data: {
            clientX: 402,
            clientY: 205,
          },
        },
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          right: 2,
        },
        rectangle: {
          top: 200,
          left: 100,
          width: 302,
          height: 150,
          right: 402,
          bottom: 350,
        },
      };
    });

    afterEach(() => {
      const fixture: ComponentFixture<TestComponent> = createComponent();
      const elm: HTMLElement =
        fixture.componentInstance.resizable.elm.nativeElement;
      domEvents.forEach((event) => {
        const element = fixture.nativeElement.querySelector(
          '.resize-handle-' + Object.keys(expectedEvent.edges)[0]
        );
        triggerDomEvent(event.name, element, event.data);
        if (event.name !== 'mouseup') {
          expect((elm.nextSibling as HTMLElement).style.position).to.equal(
            'fixed'
          );
        }
        if (event.style) {
          Object.keys(event.style).forEach((styleKey) => {
            expect((elm.nextSibling as any).style[styleKey]).to.equal(
              event.style?.[styleKey]
            );
          });
        }
      });
      expect(
        (fixture.componentInstance as any)[spyName]
      ).to.have.been.calledWith(expectedEvent);
    });
  });

  describe('handle outside of element', () => {
    let domEvents: Array<{
      name: string;
      data: { clientX: number; clientY: number };
      style?: Record<string, string>;
    }>;
    let spyName: string;
    let expectedEvent: object;

    it('should emit a starting resize event', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 200,
          },
        },
      ];
      spyName = 'resizeStart';
      expectedEvent = {
        edges: {
          right: 0,
        },
        rectangle: {
          top: 200,
          left: 100,
          width: 300,
          height: 150,
          right: 400,
          bottom: 350,
        },
      };
    });

    afterEach(() => {
      const template: string = `
      <div
        class="rectangle"
        [ngStyle]="style"
        mwlResizable
        #container='mwlResizable'
        (resizeStart)="resizeStart($event)"
      >
      </div>
       <span
          style="width: 5px; height: 5px; position: absolute; bottom: 5px; right: 5px"
          class="resize-handle"
          mwlResizeHandle
          #handle
          [resizableContainer]='container'
          [resizeEdges]="{right: true}">
        </span>
    `;
      const fixture: ComponentFixture<TestComponent> =
        createComponent(template);
      const handleElem: HTMLElement =
        fixture.componentInstance.handle.nativeElement;

      domEvents.forEach((event) => {
        triggerDomEvent(event.name, handleElem, event.data);
      });

      expect(
        (fixture.componentInstance as any)[spyName]
      ).to.have.been.calledWith(expectedEvent);
    });
  });

  it('should not resize when clicking and dragging outside of the element edges', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 10,
      clientY: 20,
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 11,
      clientY: 20,
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 12,
      clientY: 20,
    });
    triggerDomEvent('mouseup', elm, {
      clientX: 12,
      clientY: 20,
    });
    expect(fixture.componentInstance.resizeStart).not.to.have.been.called;
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
    expect(fixture.componentInstance.resizeEnd).not.to.have.been.called;
  });

  it('should cancel an existing resize event', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;

    const leftHandle = fixture.nativeElement.querySelector(
      '.resize-handle-left'
    );
    triggerDomEvent('mousedown', leftHandle, {
      clientX: 100,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
    triggerDomEvent('mousemove', leftHandle, {
      clientX: 99,
      clientY: 205,
    });
    triggerDomEvent('mousemove', leftHandle, {
      clientX: 98,
      clientY: 205,
    });
    expect((elm.nextSibling as HTMLElement).style.width).to.equal('302px');
    fixture.componentInstance.resizeEnd.resetHistory();
    triggerDomEvent('mousedown', leftHandle, {
      clientX: 100,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizeEnd).not.to.have.been.called;
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
    triggerDomEvent('mousemove', leftHandle, {
      clientX: 101,
      clientY: 205,
    });
    triggerDomEvent('mouseup', leftHandle, {
      clientX: 101,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        left: 1,
      },
      rectangle: {
        top: 200,
        left: 101,
        width: 299,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should set the cloned elements width and height on the resize start', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    const handle = fixture.nativeElement.querySelector('.resize-handle-top');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    expect((elm.nextSibling as HTMLElement).style.width).to.equal('300px');
    expect((elm.nextSibling as HTMLElement).style.height).to.equal('150px');
  });

  it('should reset existing styles after a resize', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    const handle = fixture.nativeElement.querySelector('.resize-handle-top');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 200,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 199,
    });
    let elmStyle: CSSStyleDeclaration = getComputedStyle(elm);
    expect(elmStyle.visibility).to.equal('hidden');
    triggerDomEvent('mouseup', handle, {
      clientX: 99,
      clientY: 199,
    });
    elmStyle = getComputedStyle(elm);
    expect(elmStyle.visibility).to.equal('visible');
  });

  it('should cancel the mousedrag observable when the mouseup event fires', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const handle = fixture.nativeElement.querySelector('.resize-handle-top');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 200,
    });
    triggerDomEvent('mouseup', handle, {
      clientX: 99,
      clientY: 200,
    });
    fixture.componentInstance.resizing.resetHistory();
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 199,
    });
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
  });

  it('should fire the resize end event with the last valid bounding rectangle', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 210,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 210,
    });
    triggerDomEvent('mouseup', handle, {
      clientX: 500,
      clientY: 210,
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        left: -1,
      },
      rectangle: {
        top: 200,
        left: 99,
        width: 301,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should allow invalidating of resize events', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 210,
    });
    fixture.componentInstance.validate.returns(true);
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 210,
    });
    const firstResizeEvent: ResizeEvent = {
      edges: {
        left: -1,
      },
      rectangle: {
        top: 200,
        left: 99,
        width: 301,
        height: 150,
        right: 400,
        bottom: 350,
      },
    };
    expect(fixture.componentInstance.validate).to.have.been.calledWith(
      firstResizeEvent
    );
    expect(fixture.componentInstance.resizing).to.have.been.calledWith(
      firstResizeEvent
    );
    fixture.componentInstance.validate.returns(false);
    fixture.componentInstance.validate.resetHistory();
    fixture.componentInstance.resizing.resetHistory();
    triggerDomEvent('mousemove', handle, {
      clientX: 98,
      clientY: 210,
    });
    const secondResizeEvent: ResizeEvent = {
      edges: {
        left: -2,
      },
      rectangle: {
        top: 200,
        left: 98,
        width: 302,
        height: 150,
        right: 400,
        bottom: 350,
      },
    };
    expect(fixture.componentInstance.validate).to.have.been.calledWith(
      secondResizeEvent
    );
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
    triggerDomEvent('mouseup', handle, {
      clientX: 98,
      clientY: 210,
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith(
      firstResizeEvent
    );
  });

  it('should only allow resizing of the element along the left side', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    fixture.componentInstance.resizeEdges = { left: true };
    fixture.detectChanges();
    triggerDomEvent('mousemove', handle, {
      clientX: 100,
      clientY: 200,
    });
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should disable resizing of the element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    fixture.componentInstance.resizeEdges = {};
    fixture.detectChanges();
    triggerDomEvent('mousemove', handle, {
      clientX: 100,
      clientY: 210,
    });
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 210,
    });
    expect(fixture.componentInstance.resizeStart).not.to.have.been.called;
    triggerDomEvent('mousemove', handle, {
      clientX: 101,
      clientY: 210,
    });
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
    triggerDomEvent('mouseup', handle, {
      clientX: 101,
      clientY: 210,
    });
    expect(fixture.componentInstance.resizeEnd).not.to.have.been.called;
  });

  it('should support resize handles to resize the element', () => {
    const template: string = `
      <div
        class="rectangle"
        [ngStyle]="style"
        mwlResizable
        (resizeStart)="resizeStart($event)"
        (resizing)="resizing($event)"
        (resizeEnd)="resizeEnd($event)">
        <span
          style="width: 5px; height: 5px; position: absolute; bottom: 5px; right: 5px"
          class="resize-handle"
          mwlResizeHandle
          [resizeEdges]="{bottom: true, right: true}">
        </span>
      </div>
    `;
    const fixture: ComponentFixture<TestComponent> = createComponent(template);

    const elm: any = fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm.querySelector('.resize-handle'), {
      clientX: 395,
      clientY: 345,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
    triggerDomEvent('mousemove', elm.querySelector('.resize-handle'), {
      clientX: 396,
      clientY: 345,
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 1,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 301,
        height: 150,
        right: 401,
        bottom: 350,
      },
    });
    triggerDomEvent('mouseup', elm.querySelector('.resize-handle'), {
      clientX: 396,
      clientY: 345,
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 1,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 301,
        height: 150,
        right: 401,
        bottom: 350,
      },
    });
  });

  it('should disable the temporary resize effect applied to the element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.componentInstance.enableGhostResize = false;
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 201,
    });
    const style: CSSStyleDeclaration = getComputedStyle(elm);
    expect(style.position).to.equal('relative');
    expect(style.width).to.equal('300px');
    expect(style.height).to.equal('150px');
    expect(style.top).to.equal('200px');
    expect(style.left).to.equal('100px');
  });

  it('should support resizing to a snap grid', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.componentInstance.resizeSnapGrid = { left: 10 };
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 205,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledWith({
      edges: {
        left: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 95,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledOnce;
    triggerDomEvent('mousemove', handle, {
      clientX: 89,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledWith({
      edges: {
        left: -10,
      },
      rectangle: {
        top: 200,
        left: 90,
        width: 310,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledTwice;
    triggerDomEvent('mouseup', handle, {
      clientX: 89,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        left: -10,
      },
      rectangle: {
        top: 200,
        left: 90,
        width: 310,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should not resize when the mouse is parallel with an edge but not inside the bounding rectangle', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 100,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 99,
      clientY: 101,
    });
    const style: CSSStyleDeclaration = getComputedStyle(elm);
    expect(style.position).to.equal('relative');
    expect(style.width).to.equal('300px');
    expect(style.height).to.equal('150px');
    expect(style.top).to.equal('200px');
    expect(style.left).to.equal('100px');
  });

  it('should end the mouseup observable when the component is destroyed', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const onComplete: sinon.SinonSpy = sinon.spy();
    fixture.componentInstance.resizable.mouseup.subscribe(
      () => '',
      () => '',
      onComplete
    );
    fixture.destroy();
    expect(onComplete).to.have.been.calledOnce;
  });

  it('should end the mousedown observable when the component is destroyed', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const onComplete: sinon.SinonSpy = sinon.spy();
    fixture.componentInstance.resizable.mousedown.subscribe(
      () => '',
      () => '',
      onComplete
    );
    fixture.destroy();
    expect(onComplete).to.have.been.calledOnce;
  });

  it('should end the mousemove observable when the component is destroyed', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const onComplete: sinon.SinonSpy = sinon.spy();
    fixture.componentInstance.resizable.mousemove.subscribe(
      () => '',
      () => '',
      onComplete
    );
    fixture.destroy();
    expect(onComplete).to.have.been.calledOnce;
  });

  it('should set the resize active class', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousemove', handle, {
      clientX: 100,
      clientY: 210,
    });
    expect(elm.classList.contains('resize-active')).to.be.false;
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 210,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 101,
      clientY: 210,
    });
    expect(elm.classList.contains('resize-active')).to.be.true;
    triggerDomEvent('mouseup', handle, {
      clientX: 101,
      clientY: 210,
    });
    expect(elm.classList.contains('resize-active')).to.be.false;
  });

  it('should add a class to the ghost element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    expect(elm.classList.contains('resize-ghost-element')).to.be.false;
    expect(
      (elm.nextSibling as HTMLElement).classList.contains(
        'resize-ghost-element'
      )
    ).to.be.true;
  });

  describe('absolute positioning', () => {
    let domEvents: Array<{
      name: string;
      data: { clientX: number; clientY: number };
      style?: Record<string, string>;
    }>;
    let edge: string;
    beforeEach(() => {
      domEvents = [];
    });

    it('should have the same top/left/height when resize from the right', () => {
      edge = 'right';
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 600,
          clientY: 405,
        },
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 620,
          clientY: 405,
        },
        style: {
          top: '200px',
          left: '100px',
          height: '150px',
        },
      });
    });

    it('should have the same top/height when resize from the left', () => {
      edge = 'left';
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 300,
          clientY: 405,
        },
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 280,
          clientY: 405,
        },
        style: {
          top: '200px',
          height: '150px',
        },
      });
    });

    it('should have the same left/width when resize from the top', () => {
      edge = 'top';
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 400,
          clientY: 400,
        },
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 400,
          clientY: 280,
        },
        style: {
          left: '100px',
          width: '300px',
        },
      });
    });

    it('should have the same top/left/width when resize from the bottom', () => {
      edge = 'bottom';
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 400,
          clientY: 550,
        },
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 400,
          clientY: 570,
        },
        style: {
          top: '200px',
          left: '100px',
          width: '300px',
        },
      });
    });

    afterEach(() => {
      const template = `
        <div class="container">
         <div
          class="rectangle"
          [ngStyle]="style"
          mwlResizable
          [validateResize]="validate"
          [enableGhostResize]="enableGhostResize"
          [resizeSnapGrid]="resizeSnapGrid"
          [resizeCursors]="resizeCursors"
          [ghostElementPositioning]="ghostElementPositioning"
          (resizeStart)="resizeStart($event)"
          (resizing)="resizing($event)"
          (resizeEnd)="resizeEnd($event)">
          <div
            *ngIf="resizeEdges.top"
            class="resize-handle-top"
            mwlResizeHandle
            [resizeEdges]="{ top: true }"
          ></div>
          <div
            *ngIf="resizeEdges.left"
            class="resize-handle-left"
            mwlResizeHandle
            [resizeEdges]="{ left: true }"
          ></div>
          <div
            *ngIf="resizeEdges.right"
            class="resize-handle-right"
            mwlResizeHandle
            [resizeEdges]="{ right: true }"
          ></div>
          <div
            *ngIf="resizeEdges.bottom"
            class="resize-handle-bottom"
            mwlResizeHandle
            [resizeEdges]="{ bottom: true }"
          ></div>
        </div>
      </div>
    `;
      const styles = [
        `
          .container {
            -webkit-transform: scale3d(1, 1, 1);
            position: relative;
            top: 200px;
            left: 200px;
          }
          .rectangle {
            position: absolute;
            top: 200px;
            left: 100px;
            width: 300px;
            height: 150px;
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
      ];

      const fixture: ComponentFixture<TestComponent> = createComponent(
        template,
        styles
      );
      fixture.componentInstance.ghostElementPositioning = 'absolute';
      fixture.detectChanges();

      const elm: HTMLElement =
        fixture.componentInstance.resizable.elm.nativeElement;
      domEvents.forEach((event) => {
        const handleElem: HTMLElement = fixture.nativeElement.querySelector(
          '.resize-handle-' + edge
        );
        triggerDomEvent(event.name, handleElem, event.data);

        const clonedNode: HTMLElement = (elm.parentElement as HTMLElement)
          .children[1] as HTMLElement;
        if (event.name !== 'mouseup') {
          expect(clonedNode['style'].position).to.equal('absolute');
        }
        if (event.style) {
          Object.keys(event.style).forEach((styleKey) => {
            expect((clonedNode['style'] as any)[styleKey]).to.equal(
              event.style?.[styleKey]
            );
          });
        }
      });
    });
  });

  it('should handle the drag handle being shown via an ngIf', () => {
    const template: string = `
      <div
        class="rectangle"
        [ngStyle]="style"
        mwlResizable
        (resizeStart)="resizeStart($event)"
        (resizing)="resizing($event)"
        (resizeEnd)="resizeEnd($event)">
        <span
          style="width: 5px; height: 5px; position: absolute; bottom: 5px; right: 5px"
          class="resize-handle"
          mwlResizeHandle
          *ngIf="showResizeHandle"
          [resizeEdges]="{bottom: true, right: true}">
        </span>
      </div>
    `;
    const fixture: ComponentFixture<TestComponent> = createComponent(template);

    const elm = fixture.componentInstance.resizable.elm.nativeElement;
    fixture.componentInstance.showResizeHandle = true;
    fixture.detectChanges();
    triggerDomEvent('mousedown', elm.querySelector('.resize-handle'), {
      clientX: 395,
      clientY: 345,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should set the resize cursor on the body when resizing', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 101,
      clientY: 200,
    });
    expect(document.body.style.cursor).to.equal('col-resize');
    triggerDomEvent('mouseup', handle, {
      clientX: 101,
      clientY: 200,
    });
    expect(document.body.style.cursor).to.equal('');
  });

  it('should respect the css transform on the element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    elm.style.transform = 'translate(10px, 20px)';
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 110,
      clientY: 220,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should respect the css transform on the element with negative values', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    elm.style.transform = 'translate(-10px, -20px)';
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 90,
      clientY: 180,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should respect the css transform with 3d property translate on the element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    elm.style.transform = 'translate3d(10px, 20px, 0px)';
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    triggerDomEvent('mousedown', handle, {
      clientX: 110,
      clientY: 220,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
  });

  it('should not allow negative resizes', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const handle = fixture.nativeElement.querySelector('.resize-handle-right');
    triggerDomEvent('mousedown', handle, {
      clientX: 400,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        right: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 50,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
  });

  it('should allow negative resizes', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.componentInstance.allowNegativeResizes = true;
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector('.resize-handle-right');
    triggerDomEvent('mousedown', handle, {
      clientX: 400,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        right: 0,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350,
      },
    });
    triggerDomEvent('mousemove', handle, {
      clientX: 50,
      clientY: 205,
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledWith({
      edges: {
        right: -350,
      },
      rectangle: {
        top: 200,
        left: 100,
        width: -50,
        height: 150,
        right: 50,
        bottom: 350,
      },
    });
  });

  it('should add canvas data to the ghost element', () => {
    const template: string = `
      <div
       class="rectangle"
        [ngStyle]="style"
        mwlResizable
        [enableGhostResize]="enableGhostResize"
      >
        <canvas id="canvas"></canvas>
        <div
          class="resize-handle-left"
          mwlResizeHandle
          [resizeEdges]="{ left: true }"
        ></div>
      </div>
    `;

    const fixture: ComponentFixture<TestComponent> = createComponent(template);
    const handle = fixture.nativeElement.querySelector('.resize-handle-left');
    const canvas = fixture.nativeElement.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillText('Canvas text example', 0, 0);
    const canvasData = canvas.toDataURL();

    const elm = fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', handle, {
      clientX: 100,
      clientY: 200,
    });
    const clonedDiv = elm.nextSibling as HTMLElement;
    const clonedCanvas = clonedDiv.children[0] as HTMLCanvasElement;
    const actualCanvasData = clonedCanvas.toDataURL();
    expect(actualCanvasData).to.equal(canvasData);
  });
});
