/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, Input, HostListener, Renderer2, ElementRef, NgZone } from '@angular/core';
import { ResizableDirective } from './resizable.directive';
/**
 * An element placed inside a `mwlResizable` directive to be used as a drag and resize handle
 *
 * For example
 *
 * ```html
 * <div mwlResizable>
 *   <div mwlResizeHandle [resizeEdges]="{bottom: true, right: true}"></div>
 * </div>
 * ```
 */
var ResizeHandleDirective = /** @class */ (function () {
    function ResizeHandleDirective(renderer, element, zone, resizable) {
        this.renderer = renderer;
        this.element = element;
        this.zone = zone;
        this.resizable = resizable;
        /**
         * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
         */
        this.resizeEdges = {};
        this.eventListeners = {};
    }
    /**
     * @return {?}
     */
    ResizeHandleDirective.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this.unsubscribeEventListeners();
    };
    /**
     * @hidden
     */
    /**
     * @hidden
     * @param {?} event
     * @param {?} clientX
     * @param {?} clientY
     * @return {?}
     */
    ResizeHandleDirective.prototype.onMousedown = /**
     * @hidden
     * @param {?} event
     * @param {?} clientX
     * @param {?} clientY
     * @return {?}
     */
    function (event, clientX, clientY) {
        var _this = this;
        event.preventDefault();
        this.zone.runOutsideAngular(function () {
            if (!_this.eventListeners.touchmove) {
                _this.eventListeners.touchmove = _this.renderer.listen(_this.element.nativeElement, 'touchmove', function (touchMoveEvent) {
                    _this.onMousemove(touchMoveEvent, touchMoveEvent.targetTouches[0].clientX, touchMoveEvent.targetTouches[0].clientY);
                });
            }
            if (!_this.eventListeners.mousemove) {
                _this.eventListeners.mousemove = _this.renderer.listen(_this.element.nativeElement, 'mousemove', function (mouseMoveEvent) {
                    _this.onMousemove(mouseMoveEvent, mouseMoveEvent.clientX, mouseMoveEvent.clientY);
                });
            }
            _this.resizable.mousedown.next({
                clientX: clientX,
                clientY: clientY,
                edges: _this.resizeEdges
            });
        });
    };
    /**
     * @hidden
     */
    /**
     * @hidden
     * @param {?} clientX
     * @param {?} clientY
     * @return {?}
     */
    ResizeHandleDirective.prototype.onMouseup = /**
     * @hidden
     * @param {?} clientX
     * @param {?} clientY
     * @return {?}
     */
    function (clientX, clientY) {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            _this.unsubscribeEventListeners();
            _this.resizable.mouseup.next({
                clientX: clientX,
                clientY: clientY,
                edges: _this.resizeEdges
            });
        });
    };
    /**
     * @private
     * @param {?} event
     * @param {?} clientX
     * @param {?} clientY
     * @return {?}
     */
    ResizeHandleDirective.prototype.onMousemove = /**
     * @private
     * @param {?} event
     * @param {?} clientX
     * @param {?} clientY
     * @return {?}
     */
    function (event, clientX, clientY) {
        this.resizable.mousemove.next({
            clientX: clientX,
            clientY: clientY,
            edges: this.resizeEdges,
            event: event
        });
    };
    /**
     * @private
     * @return {?}
     */
    ResizeHandleDirective.prototype.unsubscribeEventListeners = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        Object.keys(this.eventListeners).forEach(function (type) {
            ((/** @type {?} */ (_this))).eventListeners[type]();
            delete _this.eventListeners[type];
        });
    };
    ResizeHandleDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[mwlResizeHandle]'
                },] }
    ];
    /** @nocollapse */
    ResizeHandleDirective.ctorParameters = function () { return [
        { type: Renderer2 },
        { type: ElementRef },
        { type: NgZone },
        { type: ResizableDirective }
    ]; };
    ResizeHandleDirective.propDecorators = {
        resizeEdges: [{ type: Input }],
        onMousedown: [{ type: HostListener, args: ['touchstart', [
                        '$event',
                        '$event.touches[0].clientX',
                        '$event.touches[0].clientY'
                    ],] }, { type: HostListener, args: ['mousedown', ['$event', '$event.clientX', '$event.clientY'],] }],
        onMouseup: [{ type: HostListener, args: ['touchend', [
                        '$event.changedTouches[0].clientX',
                        '$event.changedTouches[0].clientY'
                    ],] }, { type: HostListener, args: ['touchcancel', [
                        '$event.changedTouches[0].clientX',
                        '$event.changedTouches[0].clientY'
                    ],] }, { type: HostListener, args: ['mouseup', ['$event.clientX', '$event.clientY'],] }]
    };
    return ResizeHandleDirective;
}());
export { ResizeHandleDirective };
if (false) {
    /**
     * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
     * @type {?}
     */
    ResizeHandleDirective.prototype.resizeEdges;
    /**
     * @type {?}
     * @private
     */
    ResizeHandleDirective.prototype.eventListeners;
    /**
     * @type {?}
     * @private
     */
    ResizeHandleDirective.prototype.renderer;
    /**
     * @type {?}
     * @private
     */
    ResizeHandleDirective.prototype.element;
    /**
     * @type {?}
     * @private
     */
    ResizeHandleDirective.prototype.zone;
    /**
     * @type {?}
     * @private
     */
    ResizeHandleDirective.prototype.resizable;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLWhhbmRsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLXJlc2l6YWJsZS1lbGVtZW50LyIsInNvdXJjZXMiOlsicmVzaXplLWhhbmRsZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLFlBQVksRUFDWixTQUFTLEVBQ1QsVUFBVSxFQUVWLE1BQU0sRUFDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7Ozs7Ozs7Ozs7O0FBYzNEO0lBZUUsK0JBQ1UsUUFBbUIsRUFDbkIsT0FBbUIsRUFDbkIsSUFBWSxFQUNaLFNBQTZCO1FBSDdCLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDbkIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUNuQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osY0FBUyxHQUFULFNBQVMsQ0FBb0I7Ozs7UUFaOUIsZ0JBQVcsR0FBVSxFQUFFLENBQUM7UUFFekIsbUJBQWMsR0FJbEIsRUFBRSxDQUFDO0lBT0osQ0FBQzs7OztJQUVKLDJDQUFXOzs7SUFBWDtRQUNFLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRzs7Ozs7Ozs7SUFPSCwyQ0FBVzs7Ozs7OztJQU5YLFVBT0UsS0FBOEIsRUFDOUIsT0FBZSxFQUNmLE9BQWU7UUFUakIsaUJBNkNDO1FBbENDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtnQkFDbEMsS0FBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQ2xELEtBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUMx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Qi9ELDRCQUFDO0NBQUEsQUF0SEQsSUFzSEM7U0FuSFkscUJBQXFCOzs7Ozs7SUFJaEMsNENBQWlDOzs7OztJQUVqQywrQ0FJTzs7Ozs7SUFHTCx5Q0FBMkI7Ozs7O0lBQzNCLHdDQUEyQjs7Ozs7SUFDM0IscUNBQW9COzs7OztJQUNwQiwwQ0FBcUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIElucHV0LFxuICBIb3N0TGlzdGVuZXIsXG4gIFJlbmRlcmVyMixcbiAgRWxlbWVudFJlZixcbiAgT25EZXN0cm95LFxuICBOZ1pvbmVcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSZXNpemFibGVEaXJlY3RpdmUgfSBmcm9tICcuL3Jlc2l6YWJsZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRWRnZXMgfSBmcm9tICcuL2ludGVyZmFjZXMvZWRnZXMuaW50ZXJmYWNlJztcblxuLyoqXG4gKiBBbiBlbGVtZW50IHBsYWNlZCBpbnNpZGUgYSBgbXdsUmVzaXphYmxlYCBkaXJlY3RpdmUgdG8gYmUgdXNlZCBhcyBhIGRyYWcgYW5kIHJlc2l6ZSBoYW5kbGVcbiAqXG4gKiBGb3IgZXhhbXBsZVxuICpcbiAqIGBgYGh0bWxcbiAqIDxkaXYgbXdsUmVzaXphYmxlPlxuICogICA8ZGl2IG13bFJlc2l6ZUhhbmRsZSBbcmVzaXplRWRnZXNdPVwie2JvdHRvbTogdHJ1ZSwgcmlnaHQ6IHRydWV9XCI+PC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbXdsUmVzaXplSGFuZGxlXSdcbn0pXG5leHBvcnQgY2xhc3MgUmVzaXplSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqXG4gICAqIFRoZSBgRWRnZXNgIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBlZGdlcyBvZiB0aGUgcGFyZW50IGVsZW1lbnQgdGhhdCBkcmFnZ2luZyB0aGUgaGFuZGxlIHdpbGwgdHJpZ2dlciBhIHJlc2l6ZSBvblxuICAgKi9cbiAgQElucHV0KCkgcmVzaXplRWRnZXM6IEVkZ2VzID0ge307XG5cbiAgcHJpdmF0ZSBldmVudExpc3RlbmVyczoge1xuICAgIHRvdWNobW92ZT86ICgpID0+IHZvaWQ7XG4gICAgbW91c2Vtb3ZlPzogKCkgPT4gdm9pZDtcbiAgICBba2V5OiBzdHJpbmddOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gIH0gPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgem9uZTogTmdab25lLFxuICAgIHByaXZhdGUgcmVzaXphYmxlOiBSZXNpemFibGVEaXJlY3RpdmVcbiAgKSB7fVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMudW5zdWJzY3JpYmVFdmVudExpc3RlbmVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBoaWRkZW5cbiAgICovXG4gIEBIb3N0TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBbXG4gICAgJyRldmVudCcsXG4gICAgJyRldmVudC50b3VjaGVzWzBdLmNsaWVudFgnLFxuICAgICckZXZlbnQudG91Y2hlc1swXS5jbGllbnRZJ1xuICBdKVxuICBASG9zdExpc3RlbmVyKCdtb3VzZWRvd24nLCBbJyRldmVudCcsICckZXZlbnQuY2xpZW50WCcsICckZXZlbnQuY2xpZW50WSddKVxuICBvbk1vdXNlZG93bihcbiAgICBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQsXG4gICAgY2xpZW50WDogbnVtYmVyLFxuICAgIGNsaWVudFk6IG51bWJlclxuICApOiB2b2lkIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZXZlbnRMaXN0ZW5lcnMudG91Y2htb3ZlKSB7XG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMudG91Y2htb3ZlID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oXG4gICAgICAgICAgdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsXG4gICAgICAgICAgJ3RvdWNobW92ZScsXG4gICAgICAgICAgKHRvdWNoTW92ZUV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uTW91c2Vtb3ZlKFxuICAgICAgICAgICAgICB0b3VjaE1vdmVFdmVudCxcbiAgICAgICAgICAgICAgdG91Y2hNb3ZlRXZlbnQudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLFxuICAgICAgICAgICAgICB0b3VjaE1vdmVFdmVudC50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmV2ZW50TGlzdGVuZXJzLm1vdXNlbW92ZSkge1xuICAgICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLm1vdXNlbW92ZSA9IHRoaXMucmVuZGVyZXIubGlzdGVuKFxuICAgICAgICAgIHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50LFxuICAgICAgICAgICdtb3VzZW1vdmUnLFxuICAgICAgICAgIChtb3VzZU1vdmVFdmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbk1vdXNlbW92ZShcbiAgICAgICAgICAgICAgbW91c2VNb3ZlRXZlbnQsXG4gICAgICAgICAgICAgIG1vdXNlTW92ZUV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICAgIG1vdXNlTW92ZUV2ZW50LmNsaWVudFlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNpemFibGUubW91c2Vkb3duLm5leHQoe1xuICAgICAgICBjbGllbnRYLFxuICAgICAgICBjbGllbnRZLFxuICAgICAgICBlZGdlczogdGhpcy5yZXNpemVFZGdlc1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGhpZGRlblxuICAgKi9cbiAgQEhvc3RMaXN0ZW5lcigndG91Y2hlbmQnLCBbXG4gICAgJyRldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYJyxcbiAgICAnJGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFknXG4gIF0pXG4gIEBIb3N0TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgW1xuICAgICckZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCcsXG4gICAgJyRldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZJ1xuICBdKVxuICBASG9zdExpc3RlbmVyKCdtb3VzZXVwJywgWyckZXZlbnQuY2xpZW50WCcsICckZXZlbnQuY2xpZW50WSddKVxuICBvbk1vdXNldXAoY2xpZW50WDogbnVtYmVyLCBjbGllbnRZOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgdGhpcy51bnN1YnNjcmliZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLnJlc2l6YWJsZS5tb3VzZXVwLm5leHQoe1xuICAgICAgICBjbGllbnRYLFxuICAgICAgICBjbGllbnRZLFxuICAgICAgICBlZGdlczogdGhpcy5yZXNpemVFZGdlc1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW91c2Vtb3ZlKFxuICAgIGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCxcbiAgICBjbGllbnRYOiBudW1iZXIsXG4gICAgY2xpZW50WTogbnVtYmVyXG4gICk6IHZvaWQge1xuICAgIHRoaXMucmVzaXphYmxlLm1vdXNlbW92ZS5uZXh0KHtcbiAgICAgIGNsaWVudFgsXG4gICAgICBjbGllbnRZLFxuICAgICAgZWRnZXM6IHRoaXMucmVzaXplRWRnZXMsXG4gICAgICBldmVudFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSB1bnN1YnNjcmliZUV2ZW50TGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuZXZlbnRMaXN0ZW5lcnMpLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAodGhpcyBhcyBhbnkpLmV2ZW50TGlzdGVuZXJzW3R5cGVdKCk7XG4gICAgICBkZWxldGUgdGhpcy5ldmVudExpc3RlbmVyc1t0eXBlXTtcbiAgICB9KTtcbiAgfVxufVxuIl19