import {Component, ViewChild} from '@angular/core';
import {NgStyle} from '@angular/common';
import {Resizable, ResizeEvent} from './../angular2-resizable';
import {
  describe,
  expect,
  it,
  inject,
  beforeEach,
  afterEach,
  async
} from '@angular/core/testing';
import {
  TestComponentBuilder,
  ComponentFixture
} from '@angular/compiler/testing';

describe('resizable directive', () => {

  @Component({
    directives: [Resizable, NgStyle],
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
        mwl-resizeable
        (onResizeStart)="onResizeStart($event)"
        (onResize)="onResize($event)"
        (onResizeEnd)="onResizeEnd($event)">
      </div>
    `
  })
  class TestCmp {

    @ViewChild(Resizable) public resizable: Resizable;
    public style: Object = {};
    public onResizeStart: jasmine.Spy;
    public onResize: jasmine.Spy;
    public onResizeEnd: jasmine.Spy;

    constructor() {
      this.onResizeStart = jasmine.createSpy('onResizeStart');
      this.onResize = jasmine.createSpy('onResize');
      this.onResizeEnd = jasmine.createSpy('onResizeEnd');
    }

  }

  const triggerDomEvent: Function = (eventType: string, target: HTMLElement, eventData: Object = {}) => {
    const event: Event = document.createEvent('Event');
    Object.assign(event, eventData);
    event.initEvent(eventType, true, true);
    target.dispatchEvent(event);
  };

  let builder: TestComponentBuilder, componentPromise: Promise<ComponentFixture<TestCmp>>;
  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
    document.body.style.margin = '0px';
    componentPromise = builder.createAsync(TestCmp).then((fixture: ComponentFixture<TestCmp>) => {
      fixture.detectChanges();
      document.body.appendChild(fixture.componentInstance.resizable.elm.nativeElement);
      return fixture;
    });
  }));

  afterEach(async(() => {
    componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
      fixture.destroy();
      document.body.innerHTML = '';
    });
  }));

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
        cursor: 'auto'
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

    afterEach(async(() => {
      componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
        const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
        assertions.forEach(({coords, cursor}: {coords: Object, cursor: string}) => {
          triggerDomEvent('mousemove', elm, coords);
          expect(elm.style.cursor).toEqual(cursor);
        });
      });
    }));

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
      spyName = 'onResizeStart';
      expectedEvent = {
        edges: {
          top: true
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
      spyName = 'onResize';
      expectedEvent = {
        edges: {
          top: true
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
      spyName = 'onResizeEnd';
      expectedEvent = {
        edges: {
          top: true
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
      spyName = 'onResizeEnd';
      expectedEvent = {
        edges: {
          left: true
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
      spyName = 'onResizeEnd';
      expectedEvent = {
        edges: {
          bottom: true
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
      spyName = 'onResizeEnd';
      expectedEvent = {
        edges: {
          right: true
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

    afterEach(async(() => {
      componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
        const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
        domEvents.forEach(event => {
          triggerDomEvent(event.name, elm, event.data);
          if (event.name !== 'mouseup') {
            expect(elm.style.position).toEqual('fixed');
          }
          if (event.style) {
            Object.keys(event.style).forEach(styleKey => {
              expect(elm.style[styleKey]).toEqual(event.style[styleKey]);
            });
          }
        });
        expect(fixture.componentInstance[spyName]).toHaveBeenCalledWith(expectedEvent);
      });
    }));

  });

  it('should not resize when clicking and dragging outside of the element edges', async(() => {

    componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
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
      expect(fixture.componentInstance.onResizeStart).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onResize).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onResizeEnd).not.toHaveBeenCalled();
    });

  }));

  it('should cancel an existing resize event', async(() => {

    componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
      const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
      triggerDomEvent('mousedown', elm, {
        clientX: 100,
        clientY: 205
      });
      expect(fixture.componentInstance.onResizeStart).toHaveBeenCalledWith({
        edges: {
          left: true
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
      expect(elm.style.width).toEqual('302px');
      fixture.componentInstance.onResizeEnd.calls.reset();
      triggerDomEvent('mousedown', elm, {
        clientX: 100,
        clientY: 205
      });
      expect(fixture.componentInstance.onResizeEnd).not.toHaveBeenCalled();
      expect(elm.style.width).toEqual('300px');
      expect(fixture.componentInstance.onResizeStart).toHaveBeenCalledWith({
        edges: {
          left: true
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
      expect(fixture.componentInstance.onResizeEnd).toHaveBeenCalledWith({
        edges: {
          left: true
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

  }));

  it('should reset existing styles after a resize', async(() => {

    componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
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
      expect(elmStyle.position).toEqual('fixed');
      expect(elmStyle.top).toEqual('199px');
      expect(elmStyle.left).toEqual('99px');
      expect(elmStyle.height).toEqual('151px');
      expect(elmStyle.width).toEqual('301px');
      triggerDomEvent('mouseup', elm, {
        clientX: 99,
        clientY: 199
      });
      elmStyle = getComputedStyle(elm);
      expect(elmStyle.position).toEqual('relative');
      expect(elmStyle.top).toEqual('200px');
      expect(elmStyle.left).toEqual('100px');
      expect(elmStyle.height).toEqual('150px');
      expect(elmStyle.width).toEqual('300px');
    });

  }));

  it('should cancel the mousedrag observable when the mouseup event fires', async(() => {
    componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
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
      fixture.componentInstance.onResize.calls.reset();
      triggerDomEvent('mousemove', elm, {
        clientX: 99,
        clientY: 199
      });
      expect(fixture.componentInstance.onResize).not.toHaveBeenCalled();
    });
  }));

});
