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

    it('should emit a starting resize event', () => {
      componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
        const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
        triggerDomEvent('mousedown', elm, {
          clientX: 150,
          clientY: 200
        });
        expect(fixture.componentInstance.onResizeStart).toHaveBeenCalledWith({
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
        });
      });
    });

    it('should emit a resize event whenever the mouse is clicked and dragged', () => {
      componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
        const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
        triggerDomEvent('mousedown', elm, {
          clientX: 150,
          clientY: 200
        });
        triggerDomEvent('mousemove', elm, {
          clientX: 150,
          clientY: 199
        });
        expect(fixture.componentInstance.onResize).toHaveBeenCalledWith({
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
        });
      });
    });

    it('should emit a resize event end whenever the mouse is clicked, dragged and released', () => {
      componentPromise.then((fixture: ComponentFixture<TestCmp>) => {
        const elm: HTMLElement = fixture.componentInstance.resizable.elm.nativeElement;
        triggerDomEvent('mousedown', elm, {
          clientX: 150,
          clientY: 200
        });
        triggerDomEvent('mousemove', elm, {
          clientX: 150,
          clientY: 199
        });
        triggerDomEvent('mousemove', elm, {
          clientX: 150,
          clientY: 198
        });
        triggerDomEvent('mouseup', elm, {
          clientX: 150,
          clientY: 198
        });
        expect(fixture.componentInstance.onResizeEnd).toHaveBeenCalledWith({
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
        });
      });
    });

  });

});
