import { Component, ViewChild } from '@angular/core';
import { ResizableDirective } from '../src/resizable.directive';
import { Edges } from '../src/interfaces/edges.interface';
import { ResizeEvent, ResizableModule } from '../src';
import { MOUSE_MOVE_THROTTLE_MS } from '../src/resizable.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('resizable directive', () => {
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
    `
    ],
    template: `
      <div
        class="rectangle"
        [ngStyle]="style"
        mwlResizable
        [validateResize]="validate"
        [resizeEdges]="resizeEdges"
        [enableGhostResize]="enableGhostResize"
        [resizeSnapGrid]="resizeSnapGrid"
        [resizeCursors]="resizeCursors"
        [resizeCursorPrecision]="resizeCursorPrecision"
        [ghostElementPositioning]="ghostElementPositioning"
        (resizeStart)="resizeStart($event)"
        (resizing)="resizing($event)"
        (resizeEnd)="resizeEnd($event)">
      </div>
    `
  })
  class TestComponent {
    @ViewChild(ResizableDirective) resizable: ResizableDirective;
    style: object = {};
    resizeStart: sinon.SinonSpy = sinon.spy();
    resizing: sinon.SinonSpy = sinon.spy();
    resizeEnd: sinon.SinonSpy = sinon.spy();
    validate: sinon.SinonStub = sinon.stub().returns(true);
    resizeEdges: Edges = {
      top: true,
      bottom: true,
      left: true,
      right: true
    };
    enableGhostResize: boolean = true;
    resizeSnapGrid: object = {};
    resizeCursors: object = {};
    resizeCursorPrecision: number;
    ghostElementPositioning: 'fixed' | 'absolute' = 'fixed';
    showResizeHandle = false;
  }

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
      declarations: [TestComponent]
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
      const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(
        TestComponent
      );
      fixture.detectChanges();
      document.body.appendChild(fixture.nativeElement.children[0]);
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

  describe('cursor changes', () => {
    let assertions: any[];

    it('should change the cursor to the ns-resize when mousing over the top edge', () => {
      assertions = [
        {
          coords: {
            clientX: 150,
            clientY: 200
          },
          cursor: 'ns-resize'
        }
      ];
    });

    it('should change the cursor back to auto when moving away from the edge', () => {
      assertions = [
        {
          coords: {
            clientX: 150,
            clientY: 200
          },
          cursor: 'ns-resize'
        },
        {
          coords: {
            clientX: 150,
            clientY: 197
          },
          cursor: ''
        }
      ];
    });

    it('should change the cursor to the ns-resize when mousing over the bottom edge', () => {
      assertions = [
        {
          coords: {
            clientX: 150,
            clientY: 350
          },
          cursor: 'ns-resize'
        }
      ];
    });

    it('should change the cursor to the ew-resize when mousing over the left edge', () => {
      assertions = [
        {
          coords: {
            clientX: 100,
            clientY: 300
          },
          cursor: 'ew-resize'
        }
      ];
    });

    it('should change the cursor to the ew-resize when mousing over the right edge', () => {
      assertions = [
        {
          coords: {
            clientX: 400,
            clientY: 300
          },
          cursor: 'ew-resize'
        }
      ];
    });

    it('should change the cursor to the nw-resize when mousing over the top left edge', () => {
      assertions = [
        {
          coords: {
            clientX: 100,
            clientY: 200
          },
          cursor: 'nw-resize'
        }
      ];
    });

    it('should change the cursor to the ne-resize when mousing over the top right edge', () => {
      assertions = [
        {
          coords: {
            clientX: 400,
            clientY: 200
          },
          cursor: 'ne-resize'
        }
      ];
    });

    it('should change the cursor to the sw-resize when mousing over the bottom left edge', () => {
      assertions = [
        {
          coords: {
            clientX: 100,
            clientY: 350
          },
          cursor: 'sw-resize'
        }
      ];
    });

    it('should change the cursor to the se-resize when mousing over the bottom right edge', () => {
      assertions = [
        {
          coords: {
            clientX: 400,
            clientY: 350
          },
          cursor: 'se-resize'
        }
      ];
    });

    afterEach(done => {
      let count: number = 0;
      const fixture: ComponentFixture<TestComponent> = createComponent();
      const elm: HTMLElement =
        fixture.componentInstance.resizable.elm.nativeElement;

      function runAssertion(): void {
        if (count === assertions.length) {
          done();
        } else {
          const { coords, cursor } = assertions[count];
          triggerDomEvent('mousemove', elm, coords);
          expect(elm.style.cursor).to.equal(cursor);
          count++;
          setTimeout(runAssertion, MOUSE_MOVE_THROTTLE_MS);
        }
      }

      runAssertion();
    });
  });

  describe('resize events', () => {
    let domEvents: any[];
    let spyName: string;
    let expectedEvent: object;

    it('should emit a starting resize event', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 200
          }
        }
      ];
      spyName = 'resizeStart';
      expectedEvent = {
        edges: {
          top: 0
        },
        rectangle: {
          top: 200,
          left: 100,
          width: 300,
          height: 150,
          right: 400,
          bottom: 350
        }
      };
    });

    it('should emit a resize event whenever the mouse is clicked and dragged', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 200
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 199
          }
        }
      ];
      spyName = 'resizing';
      expectedEvent = {
        edges: {
          top: -1
        },
        rectangle: {
          top: 199,
          left: 100,
          width: 300,
          height: 151,
          right: 400,
          bottom: 350
        }
      };
    });

    it('should resize from the top', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 200
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 199
          },
          style: {
            top: '199px',
            left: '100px',
            width: '300px',
            height: '151px'
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 198
          },
          style: {
            top: '198px',
            left: '100px',
            width: '300px',
            height: '152px'
          }
        },
        {
          name: 'mouseup',
          data: {
            clientX: 150,
            clientY: 198
          }
        }
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          top: -2
        },
        rectangle: {
          top: 198,
          left: 100,
          width: 300,
          height: 152,
          right: 400,
          bottom: 350
        }
      };
    });

    it('should resize from the left', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 100,
            clientY: 205
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 99,
            clientY: 205
          },
          style: {
            top: '200px',
            left: '99px',
            width: '301px',
            height: '150px'
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 98,
            clientY: 205
          },
          style: {
            top: '200px',
            left: '98px',
            width: '302px',
            height: '150px'
          }
        },
        {
          name: 'mouseup',
          data: {
            clientX: 98,
            clientY: 205
          }
        }
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          left: -2
        },
        rectangle: {
          top: 200,
          left: 98,
          width: 302,
          height: 150,
          right: 400,
          bottom: 350
        }
      };
    });

    it('should resize from the bottom', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 150,
            clientY: 350
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 351
          },
          style: {
            top: '200px',
            left: '100px',
            width: '300px',
            height: '151px'
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 150,
            clientY: 352
          },
          style: {
            top: '200px',
            left: '100px',
            width: '300px',
            height: '152px'
          }
        },
        {
          name: 'mouseup',
          data: {
            clientX: 150,
            clientY: 352
          }
        }
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          bottom: 2
        },
        rectangle: {
          top: 200,
          left: 100,
          width: 300,
          height: 152,
          right: 400,
          bottom: 352
        }
      };
    });

    it('should resize from the right', () => {
      domEvents = [
        {
          name: 'mousedown',
          data: {
            clientX: 400,
            clientY: 205
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 401,
            clientY: 205
          },
          style: {
            top: '200px',
            left: '100px',
            width: '301px',
            height: '150px'
          }
        },
        {
          name: 'mousemove',
          data: {
            clientX: 402,
            clientY: 205
          },
          style: {
            top: '200px',
            left: '100px',
            width: '302px',
            height: '150px'
          }
        },
        {
          name: 'mouseup',
          data: {
            clientX: 402,
            clientY: 205
          }
        }
      ];
      spyName = 'resizeEnd';
      expectedEvent = {
        edges: {
          right: 2
        },
        rectangle: {
          top: 200,
          left: 100,
          width: 302,
          height: 150,
          right: 402,
          bottom: 350
        }
      };
    });

    afterEach(() => {
      const fixture: ComponentFixture<TestComponent> = createComponent();
      const elm: HTMLElement =
        fixture.componentInstance.resizable.elm.nativeElement;
      domEvents.forEach(event => {
        triggerDomEvent(event.name, elm, event.data);
        if (event.name !== 'mouseup') {
          expect((elm.nextSibling as HTMLElement).style.position).to.equal(
            'fixed'
          );
        }
        if (event.style) {
          Object.keys(event.style).forEach(styleKey => {
            expect((elm.nextSibling as any).style[styleKey]).to.equal(
              event.style[styleKey]
            );
          });
        }
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
      clientY: 20
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 11,
      clientY: 20
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 12,
      clientY: 20
    });
    triggerDomEvent('mouseup', elm, {
      clientX: 12,
      clientY: 20
    });
    expect(fixture.componentInstance.resizeStart).not.to.have.been.called;
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
    expect(fixture.componentInstance.resizeEnd).not.to.have.been.called;
  });

  it('should cancel an existing resize event', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 205
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 205
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 98,
      clientY: 205
    });
    expect((elm.nextSibling as HTMLElement).style.width).to.equal('302px');
    fixture.componentInstance.resizeEnd.resetHistory();
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 205
    });
    expect(fixture.componentInstance.resizeEnd).not.to.have.been.called;
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 101,
      clientY: 205
    });
    triggerDomEvent('mouseup', elm, {
      clientX: 101,
      clientY: 205
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        left: 1
      },
      rectangle: {
        top: 200,
        left: 101,
        width: 299,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
  });

  it('should set the cloned elements width and height on the resize start', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 200
    });
    expect((elm.nextSibling as HTMLElement).style.width).to.equal('300px');
    expect((elm.nextSibling as HTMLElement).style.height).to.equal('150px');
  });

  it('should reset existing styles after a resize', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 200
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 200
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 199
    });
    let elmStyle: CSSStyleDeclaration = getComputedStyle(elm);
    expect(elmStyle.visibility).to.equal('hidden');
    triggerDomEvent('mouseup', elm, {
      clientX: 99,
      clientY: 199
    });
    elmStyle = getComputedStyle(elm);
    expect(elmStyle.visibility).to.equal('visible');
  });

  it('should cancel the mousedrag observable when the mouseup event fires', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 200
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 200
    });
    triggerDomEvent('mouseup', elm, {
      clientX: 99,
      clientY: 200
    });
    fixture.componentInstance.resizing.resetHistory();
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 199
    });
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
  });

  it('should fire the resize end event with the last valid bounding rectangle', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 210
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 210
    });
    triggerDomEvent('mouseup', elm, {
      clientX: 500,
      clientY: 210
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        left: -1
      },
      rectangle: {
        top: 200,
        left: 99,
        width: 301,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
  });

  it('should allow invalidating of resize events', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 210
    });
    fixture.componentInstance.validate.returns(true);
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 210
    });
    const firstResizeEvent: ResizeEvent = {
      edges: {
        left: -1
      },
      rectangle: {
        top: 200,
        left: 99,
        width: 301,
        height: 150,
        right: 400,
        bottom: 350
      }
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
    triggerDomEvent('mousemove', elm, {
      clientX: 98,
      clientY: 210
    });
    const secondResizeEvent: ResizeEvent = {
      edges: {
        left: -2
      },
      rectangle: {
        top: 200,
        left: 98,
        width: 302,
        height: 150,
        right: 400,
        bottom: 350
      }
    };
    expect(fixture.componentInstance.validate).to.have.been.calledWith(
      secondResizeEvent
    );
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
    triggerDomEvent('mouseup', elm, {
      clientX: 98,
      clientY: 210
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith(
      firstResizeEvent
    );
  });

  it('should only allow resizing of the element along the left side', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    fixture.componentInstance.resizeEdges = { left: true };
    fixture.detectChanges();
    triggerDomEvent('mousemove', elm, {
      clientX: 100,
      clientY: 200
    });
    expect(getComputedStyle(elm).cursor).to.equal('ew-resize');
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 200
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
  });

  it('should disable resizing of the element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    fixture.componentInstance.resizeEdges = {};
    fixture.detectChanges();
    triggerDomEvent('mousemove', elm, {
      clientX: 100,
      clientY: 210
    });
    expect(getComputedStyle(elm).cursor).to.equal('auto');
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 210
    });
    expect(fixture.componentInstance.resizeStart).not.to.have.been.called;
    triggerDomEvent('mousemove', elm, {
      clientX: 101,
      clientY: 210
    });
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
    triggerDomEvent('mouseup', elm, {
      clientX: 101,
      clientY: 210
    });
    expect(fixture.componentInstance.resizeEnd).not.to.have.been.called;
  });

  it('should support drag handles to resize the element', () => {
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
      clientY: 345
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 0
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
    triggerDomEvent('mousemove', elm.querySelector('.resize-handle'), {
      clientX: 396,
      clientY: 345
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 1
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 301,
        height: 150,
        right: 401,
        bottom: 350
      }
    });
    triggerDomEvent('mouseup', elm.querySelector('.resize-handle'), {
      clientX: 396,
      clientY: 345
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 1
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 301,
        height: 150,
        right: 401,
        bottom: 350
      }
    });
  });

  it('should disable the temporary resize effect applied to the element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.componentInstance.enableGhostResize = false;
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 200
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 201
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
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 205
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 205
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledWith({
      edges: {
        left: 0
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 95,
      clientY: 205
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledOnce;
    triggerDomEvent('mousemove', elm, {
      clientX: 89,
      clientY: 205
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledWith({
      edges: {
        left: -10
      },
      rectangle: {
        top: 200,
        left: 90,
        width: 310,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
    expect(fixture.componentInstance.resizing).to.have.been.calledTwice;
    triggerDomEvent('mouseup', elm, {
      clientX: 89,
      clientY: 205
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith({
      edges: {
        left: -10
      },
      rectangle: {
        top: 200,
        left: 90,
        width: 310,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
  });

  it('should not resize when the mouse is parallel with an edge but not inside the bounding rectangle', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 100
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 101
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

  it('should allow the resize cursor to be customised', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.componentInstance.resizeCursors = { leftOrRight: 'col-resize' };
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousemove', elm, { clientX: 100, clientY: 300 });
    expect(elm.style.cursor).to.equal('col-resize');
    fixture.destroy();
  });

  it('should allow the cursor precision to be customised', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.componentInstance.resizeCursorPrecision = 5;
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousemove', elm, { clientX: 96, clientY: 296 });
    expect(elm.style.cursor).to.equal('ew-resize');
    fixture.destroy();
  });

  it('should set the resize active class', done => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousemove', elm, {
      clientX: 100,
      clientY: 210
    });
    expect(elm.classList.contains('resize-active')).to.be.false;
    setTimeout(() => {
      triggerDomEvent('mousedown', elm, {
        clientX: 100,
        clientY: 210
      });
      triggerDomEvent('mousemove', elm, {
        clientX: 101,
        clientY: 210
      });
      expect(elm.classList.contains('resize-active')).to.be.true;
      triggerDomEvent('mouseup', elm, {
        clientX: 101,
        clientY: 210
      });
      expect(elm.classList.contains('resize-active')).to.be.false;
      done();
    }, MOUSE_MOVE_THROTTLE_MS);
  });

  it('should set the resize edge classes', done => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousemove', elm, { clientX: 100, clientY: 300 });
    expect(elm.classList.contains('resize-left-hover')).to.be.true;
    expect(elm.classList.contains('resize-top-hover')).to.be.false;
    expect(elm.classList.contains('resize-right-hover')).to.be.false;
    expect(elm.classList.contains('resize-bottom-hover')).to.be.false;
    setTimeout(() => {
      triggerDomEvent('mousemove', elm, { clientX: 50, clientY: 300 });
      expect(elm.classList.contains('resize-left-hover')).to.be.false;
      fixture.destroy();
      done();
    }, MOUSE_MOVE_THROTTLE_MS);
  });

  it('should add a class to the ghost element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    fixture.detectChanges();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 200
    });
    expect(elm.classList.contains('resize-ghost-element')).to.be.false;
    expect(
      (elm.nextSibling as HTMLElement).classList.contains(
        'resize-ghost-element'
      )
    ).to.be.true;
  });

  describe('absolute positioning', () => {
    let domEvents: any[];
    beforeEach(() => {
      domEvents = [];
    });

    it('should have the same top/left/height when resize from the right', () => {
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 600,
          clientY: 405
        }
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 620,
          clientY: 405
        },
        style: {
          top: '200px',
          left: '100px',
          height: '150px'
        }
      });
    });

    it('should have the same top/height when resize from the left', () => {
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 300,
          clientY: 405
        }
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 280,
          clientY: 405
        },
        style: {
          top: '200px',
          height: '150px'
        }
      });
    });

    it('should have the same left/width when resize from the top', () => {
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 400,
          clientY: 400
        }
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 400,
          clientY: 280
        },
        style: {
          left: '100px',
          width: '300px'
        }
      });
    });

    it('should have the same top/left/width when resize from the bottom', () => {
      domEvents.push({
        name: 'mousedown',
        data: {
          clientX: 400,
          clientY: 550
        }
      });
      domEvents.push({
        name: 'mousemove',
        data: {
          clientX: 400,
          clientY: 570
        },
        style: {
          top: '200px',
          left: '100px',
          width: '300px'
        }
      });
    });

    afterEach(() => {
      const template: string = `
        <div class="container">
         <div
          class="rectangle"
          [ngStyle]="style"
          mwlResizable
          [validateResize]="validate"
          [resizeEdges]="resizeEdges"
          [enableGhostResize]="enableGhostResize"
          [resizeSnapGrid]="resizeSnapGrid"
          [resizeCursors]="resizeCursors"
          [resizeCursorPrecision]="resizeCursorPrecision"
          [ghostElementPositioning]="ghostElementPositioning"
          (resizeStart)="resizeStart($event)"
          (resizing)="resizing($event)"
          (resizeEnd)="resizeEnd($event)">
          </div>
      </div>
    `;
      const styles: string[] = [
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
      `
      ];

      const fixture: ComponentFixture<TestComponent> = createComponent(
        template,
        styles
      );
      fixture.componentInstance.ghostElementPositioning = 'absolute';
      fixture.detectChanges();

      const elm: HTMLElement =
        fixture.componentInstance.resizable.elm.nativeElement;
      domEvents.forEach(event => {
        triggerDomEvent(event.name, elm, event.data);

        const clonedNode: HTMLElement = (elm.parentElement as HTMLElement)
          .children[1] as HTMLElement;
        if (event.name !== 'mouseup') {
          expect(clonedNode['style'].position).to.equal('absolute');
        }
        if (event.style) {
          Object.keys(event.style).forEach(styleKey => {
            expect((clonedNode['style'] as any)[styleKey]).to.equal(
              event.style[styleKey]
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

    const elm: any = fixture.componentInstance.resizable.elm.nativeElement;
    fixture.componentInstance.showResizeHandle = true;
    fixture.detectChanges();
    triggerDomEvent('mousedown', elm.querySelector('.resize-handle'), {
      clientX: 395,
      clientY: 345
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        bottom: 0,
        right: 0
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
  });

  it('should set the resize cursor on the body when resizing', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousedown', elm, {
      clientX: 100,
      clientY: 200
    });
    triggerDomEvent('mousemove', elm, {
      clientX: 101,
      clientY: 200
    });
    expect(document.body.style.cursor).to.equal('nw-resize');
    triggerDomEvent('mouseup', elm, {
      clientX: 101,
      clientY: 200
    });
    expect(document.body.style.cursor).to.equal('');
  });

  it('should respect the css transform on the element', () => {
    const fixture: ComponentFixture<TestComponent> = createComponent();
    const elm: HTMLElement =
      fixture.componentInstance.resizable.elm.nativeElement;
    elm.style.transform = 'translate(10px, 20px)';
    triggerDomEvent('mousedown', elm, {
      clientX: 110,
      clientY: 220
    });
    expect(fixture.componentInstance.resizeStart).to.have.been.calledWith({
      edges: {
        left: 0,
        top: 0
      },
      rectangle: {
        top: 200,
        left: 100,
        width: 300,
        height: 150,
        right: 400,
        bottom: 350
      }
    });
  });
});
