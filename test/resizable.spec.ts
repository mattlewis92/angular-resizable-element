import {Component, ViewChild} from '@angular/core';
import {Edges, Resizable} from './../src/resizable.directive';
import {ResizeEvent, ResizableModule} from './../src';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from 'chai';
import * as sinon from 'sinon';

describe('resizable directive', () => {

  @Component({
    styles: [`
      .rectangle {
        position: relative;
        top: 200px;
        left: 100px;
        width: 300px;
        height: 150px;
      }
    `],
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
        (resizeStart)="resizeStart($event)"
        (resizing)="resizing($event)"
        (resizeEnd)="resizeEnd($event)">
      </div>
    `
  })
  class TestCmp {

    @ViewChild(Resizable) public resizable: Resizable;
    public style: Object = {};
    public resizeStart: sinon.SinonSpy = sinon.spy();
    public resizing: sinon.SinonSpy = sinon.spy();
    public resizeEnd: sinon.SinonSpy = sinon.spy();
    public validate: sinon.SinonStub = sinon.stub().returns(true);
    public resizeEdges: Edges = {top: true, bottom: true, left: true, right: true};
    public enableGhostResize: boolean = true;
    public resizeSnapGrid: Object = {};
    public resizeCursors: Object = {};

  }

  const triggerDomEvent: Function = (eventType: string, target: HTMLElement | Element, eventData: Object = {}) => {
    const event: Event = document.createEvent('Event');
    Object.assign(event, eventData);
    event.initEvent(eventType, true, true);
    target.dispatchEvent(event);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [ResizableModule], declarations: [TestCmp]});
  });

  let component: ComponentFixture<TestCmp>, createComponent: Function;
  beforeEach(() => {
    document.body.style.margin = '0px';
    createComponent = (template?: string) => {
      if (template) {
        TestBed.overrideComponent(TestCmp, {set: {template}});
      }
      const fixture: ComponentFixture<TestCmp> = TestBed.createComponent(TestCmp);
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

    let assertions: Array<Object>;

    it('should change the cursor to the ns-resize when mousing over the top edge', () => {
      assertions = [{
        coords: {
          clientX: 150,
          clientY: 200
        },
        cursor: 'ns-resize'
      }];
    });

    it('should change the cursor back to auto when moving away from the edge', () => {
      assertions = [{
        coords: {
          clientX: 150,
          clientY: 200
        },
        cursor: 'ns-resize'
      }, {
        coords: {
          clientX: 150,
          clientY: 197
        },
        cursor: ''
      }];
    });

    it('should change the cursor to the ns-resize when mousing over the bottom edge', () => {
      assertions = [{
        coords: {
          clientX: 150,
          clientY: 350
        },
        cursor: 'ns-resize'
      }];
    });

    it('should change the cursor to the ew-resize when mousing over the left edge', () => {
      assertions = [{
        coords: {
          clientX: 100,
          clientY: 300
        },
        cursor: 'ew-resize'
      }];
    });

    it('should change the cursor to the ew-resize when mousing over the right edge', () => {
      assertions = [{
        coords: {
          clientX: 400,
          clientY: 300
        },
        cursor: 'ew-resize'
      }];
    });

    it('should change the cursor to the nw-resize when mousing over the top left edge', () => {
      assertions = [{
        coords: {
          clientX: 100,
          clientY: 200
        },
        cursor: 'nw-resize'
      }];
    });

    it('should change the cursor to the ne-resize when mousing over the top right edge', () => {
      assertions = [{
        coords: {
          clientX: 400,
          clientY: 200
        },
        cursor: 'ne-resize'
      }];
    });

    it('should change the cursor to the sw-resize when mousing over the bottom left edge', () => {
      assertions = [{
        coords: {
          clientX: 100,
          clientY: 350
        },
        cursor: 'sw-resize'
      }];
    });

    it('should change the cursor to the se-resize when mousing over the bottom right edge', () => {
      assertions = [{
        coords: {
          clientX: 400,
          clientY: 350
        },
        cursor: 'se-resize'
      }];
    });

    afterEach(() => {
      const fixture: ComponentFixture<TestCmp> = createComponent();
      const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
      assertions.forEach(({coords, cursor}: {coords: Object, cursor: string}) => {
        triggerDomEvent('mousemove', elm, coords);
        expect(elm.style.cursor).to.equal(cursor);
      });
    });

  });

  describe('resize events', () => {

    let domEvents: Array<any>, spyName: string, expectedEvent: Object;

    it('should emit a starting resize event', () => {
      domEvents = [{
        name: 'mousedown',
        data: {
          clientX: 150,
          clientY: 200
        }
      }];
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
      domEvents = [{
        name: 'mousedown',
        data: {
          clientX: 150,
          clientY: 200
        }
      }, {
        name: 'mousemove',
        data: {
          clientX: 150,
          clientY: 199
        }
      }];
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
      domEvents = [{
        name: 'mousedown',
        data: {
          clientX: 150,
          clientY: 200
        }
      }, {
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
      }, {
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
      }, {
        name: 'mouseup',
        data: {
          clientX: 150,
          clientY: 198
        }
      }];
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
      domEvents = [{
        name: 'mousedown',
        data: {
          clientX: 100,
          clientY: 205
        }
      }, {
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
      }, {
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
      }, {
        name: 'mouseup',
        data: {
          clientX: 98,
          clientY: 205
        }
      }];
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
      domEvents = [{
        name: 'mousedown',
        data: {
          clientX: 150,
          clientY: 350
        }
      }, {
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
      }, {
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
      }, {
        name: 'mouseup',
        data: {
          clientX: 150,
          clientY: 352
        }
      }];
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
      domEvents = [{
        name: 'mousedown',
        data: {
          clientX: 400,
          clientY: 205
        }
      }, {
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
      }, {
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
      }, {
        name: 'mouseup',
        data: {
          clientX: 402,
          clientY: 205
        }
      }];
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
      const fixture: ComponentFixture<TestCmp> = createComponent();
      const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
      domEvents.forEach(event => {
        triggerDomEvent(event.name, elm, event.data);
        if (event.name !== 'mouseup') {
          expect(elm.nextSibling['style'].position).to.equal('fixed');
        }
        if (event.style) {
          Object.keys(event.style).forEach(styleKey => {
            expect(elm.nextSibling['style'][styleKey]).to.equal(event.style[styleKey]);
          });
        }
      });
      expect(fixture.componentInstance[spyName]).to.have.been.calledWith(expectedEvent);
    });

  });

  it('should not resize when clicking and dragging outside of the element edges', () => {

    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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

    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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
    expect(elm.nextSibling['style'].width).to.equal('302px');
    fixture.componentInstance.resizeEnd.reset();
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

  it('should reset existing styles after a resize', () => {

    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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

    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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
    fixture.componentInstance.resizing.reset();
    triggerDomEvent('mousemove', elm, {
      clientX: 99,
      clientY: 199
    });
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
  });

  it('should fire the resize end event with the last valid bounding rectangle', () => {
    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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
    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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
    expect(fixture.componentInstance.validate).to.have.been.calledWith(firstResizeEvent);
    expect(fixture.componentInstance.resizing).to.have.been.calledWith(firstResizeEvent);
    fixture.componentInstance.validate.returns(false);
    fixture.componentInstance.validate.reset();
    fixture.componentInstance.resizing.reset();
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
    expect(fixture.componentInstance.validate).to.have.been.calledWith(secondResizeEvent);
    expect(fixture.componentInstance.resizing).not.to.have.been.called;
    triggerDomEvent('mouseup', elm, {
      clientX: 98,
      clientY: 210
    });
    expect(fixture.componentInstance.resizeEnd).to.have.been.calledWith(firstResizeEvent);
  });

  it('should only allow resizing of the element along the left side', () => {

    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
    fixture.componentInstance.resizeEdges = {left: true};
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

    const fixture: ComponentFixture<TestCmp> = createComponent();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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
    const fixture: ComponentFixture<TestCmp> = createComponent(template);

    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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

    const fixture: ComponentFixture<TestCmp> = createComponent();
    fixture.componentInstance.enableGhostResize = false;
    fixture.detectChanges();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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

    const fixture: ComponentFixture<TestCmp> = createComponent();
    fixture.componentInstance.resizeSnapGrid = {left: 10};
    fixture.detectChanges();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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

    const fixture: ComponentFixture<TestCmp> = createComponent();
    fixture.detectChanges();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
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

    const fixture: ComponentFixture<TestCmp> = createComponent();
    fixture.detectChanges();
    const onComplete: sinon.SinonSpy = sinon.spy();
    fixture.componentInstance.resizable.mouseup.subscribe(() => '', () => '', onComplete);
    fixture.destroy();
    expect(onComplete).to.have.been.calledOnce;

  });

  it('should end the mousedown observable when the component is destroyed', () => {

    const fixture: ComponentFixture<TestCmp> = createComponent();
    fixture.detectChanges();
    const onComplete: sinon.SinonSpy = sinon.spy();
    fixture.componentInstance.resizable.mousedown.subscribe(() => '', () => '', onComplete);
    fixture.destroy();
    expect(onComplete).to.have.been.calledOnce;

  });

  it('should end the mousemove observable when the component is destroyed', () => {

    const fixture: ComponentFixture<TestCmp> = createComponent();
    fixture.detectChanges();
    const onComplete: sinon.SinonSpy = sinon.spy();
    fixture.componentInstance.resizable.mousemove.subscribe(() => '', () => '', onComplete);
    fixture.destroy();
    expect(onComplete).to.have.been.calledOnce;

  });

  it('should allow the resize cursor to be customised', () => {

    const fixture: ComponentFixture<TestCmp> = createComponent();
    fixture.componentInstance.resizeCursors = {leftOrRight: 'col-resize'};
    fixture.detectChanges();
    const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
    triggerDomEvent('mousemove', elm, {clientX: 100, clientY: 300});
    expect(elm.style.cursor).to.equal('col-resize');
    fixture.destroy();

  });

});
