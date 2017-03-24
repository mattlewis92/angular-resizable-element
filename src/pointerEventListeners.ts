import {Renderer2, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

export interface PointerEventCoordinate {
  clientX: number;
  clientY: number;
  event: MouseEvent | TouchEvent;
}

export class PointerEventListeners {

  public pointerDown: Observable<PointerEventCoordinate>;

  public pointerMove: Observable<PointerEventCoordinate>;

  public pointerUp: Observable<PointerEventCoordinate>;

  private static instance: PointerEventListeners; // tslint:disable-line

  public static getInstance(renderer: Renderer2, zone: NgZone): PointerEventListeners {
    if (!PointerEventListeners.instance) {
      PointerEventListeners.instance = new PointerEventListeners(renderer, zone);
    }
    return PointerEventListeners.instance;
  }

  constructor(renderer: Renderer2, zone: NgZone) {

    zone.runOutsideAngular(() => {

      this.pointerDown = new Observable((observer: Observer<PointerEventCoordinate>) => {

        const unsubscribeMouseDown: Function = renderer.listen('document', 'mousedown', (event: MouseEvent) => {
          observer.next({clientX: event.clientX, clientY: event.clientY, event});
        });

        const unsubscribeTouchStart: Function = renderer.listen('document', 'touchstart', (event: TouchEvent) => {
          observer.next({clientX: event.touches[0].clientX, clientY: event.touches[0].clientY, event});
        });

        return () => {
          unsubscribeMouseDown();
          unsubscribeTouchStart();
        };

      }).share();

      this.pointerMove = new Observable((observer: Observer<PointerEventCoordinate>) => {

        const unsubscribeMouseMove: Function = renderer.listen('document', 'mousemove', (event: MouseEvent) => {
          observer.next({clientX: event.clientX, clientY: event.clientY, event});
        });

        const unsubscribeTouchMove: Function = renderer.listen('document', 'touchmove', (event: TouchEvent) => {
          observer.next({clientX: event.targetTouches[0].clientX, clientY: event.targetTouches[0].clientY, event});
        });

        return () => {
          unsubscribeMouseMove();
          unsubscribeTouchMove();
        };

      }).share();

      this.pointerUp = new Observable((observer: Observer<PointerEventCoordinate>) => {

        const unsubscribeMouseUp: Function = renderer.listen('document', 'mouseup', (event: MouseEvent) => {
          observer.next({clientX: event.clientX, clientY: event.clientY, event});
        });

        const unsubscribeTouchEnd: Function = renderer.listen('document', 'touchend', (event: TouchEvent) => {
          observer.next({clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY, event});
        });

        const unsubscribeTouchCancel: Function = renderer.listen('document', 'touchcancel', (event: TouchEvent) => {
          observer.next({clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY, event});
        });

        return () => {
          unsubscribeMouseUp();
          unsubscribeTouchEnd();
          unsubscribeTouchCancel();
        };

      }).share();

    });

  }

}