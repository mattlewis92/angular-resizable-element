(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('rxjs'), require('rxjs/operators'), require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('angular-resizable-element', ['exports', '@angular/common', 'rxjs', 'rxjs/operators', '@angular/core'], factory) :
    (factory((global['angular-resizable-element'] = {}),global.ng.common,global.rxjs,global.rxjs.operators,global.ng.core));
}(this, (function (exports,common,rxjs,operators,core) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /**
     * @param {?} value1
     * @param {?} value2
     * @param {?=} precision
     * @return {?}
     */
    function isNumberCloseTo(value1, value2, precision) {
        if (precision === void 0) {
            precision = 3;
        }
        /** @type {?} */
        var diff = Math.abs(value1 - value2);
        return diff < precision;
    }
    /**
     * @param {?} startingRect
     * @param {?} edges
     * @param {?} clientX
     * @param {?} clientY
     * @return {?}
     */
    function getNewBoundingRectangle(startingRect, edges, clientX, clientY) {
        /** @type {?} */
        var newBoundingRect = {
            top: startingRect.top,
            bottom: startingRect.bottom,
            left: startingRect.left,
            right: startingRect.right
        };
        if (edges.top) {
            newBoundingRect.top += clientY;
        }
        if (edges.bottom) {
            newBoundingRect.bottom += clientY;
        }
        if (edges.left) {
            newBoundingRect.left += clientX;
        }
        if (edges.right) {
            newBoundingRect.right += clientX;
        }
        newBoundingRect.height = newBoundingRect.bottom - newBoundingRect.top;
        newBoundingRect.width = newBoundingRect.right - newBoundingRect.left;
        return newBoundingRect;
    }
    /**
     * @param {?} element
     * @param {?} ghostElementPositioning
     * @return {?}
     */
    function getElementRect(element, ghostElementPositioning) {
        /** @type {?} */
        var translateX = 0;
        /** @type {?} */
        var translateY = 0;
        /** @type {?} */
        var style = element.nativeElement.style;
        /** @type {?} */
        var transformProperties = [
            'transform',
            '-ms-transform',
            '-moz-transform',
            '-o-transform'
        ];
        /** @type {?} */
        var transform = transformProperties
            .map(function (property) { return style[property]; })
            .find(function (value) { return !!value; });
        if (transform && transform.includes('translate3d')) {
            translateX = transform.replace(/.*translate3d\((.*)px, (.*)px, (.*)px\).*/, '$1');
            translateY = transform.replace(/.*translate3d\((.*)px, (.*)px, (.*)px\).*/, '$2');
        }
        else if (transform && transform.includes('translate')) {
            translateX = transform.replace(/.*translate\((.*)px, (.*)px\).*/, '$1');
            translateY = transform.replace(/.*translate\((.*)px, (.*)px\).*/, '$2');
        }
        if (ghostElementPositioning === 'absolute') {
            return {
                height: element.nativeElement.offsetHeight,
                width: element.nativeElement.offsetWidth,
                top: element.nativeElement.offsetTop - translateY,
                bottom: element.nativeElement.offsetHeight +
                    element.nativeElement.offsetTop -
                    translateY,
                left: element.nativeElement.offsetLeft - translateX,
                right: element.nativeElement.offsetWidth +
                    element.nativeElement.offsetLeft -
                    translateX
            };
        }
        else {
            /** @type {?} */
            var boundingRect = element.nativeElement.getBoundingClientRect();
            return {
                height: boundingRect.height,
                width: boundingRect.width,
                top: boundingRect.top - translateY,
                bottom: boundingRect.bottom - translateY,
                left: boundingRect.left - translateX,
                right: boundingRect.right - translateX,
                scrollTop: element.nativeElement.scrollTop,
                scrollLeft: element.nativeElement.scrollLeft
            };
        }
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    function isWithinBoundingY(_a) {
        var clientY = _a.clientY, rect = _a.rect;
        return clientY >= rect.top && clientY <= rect.bottom;
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    function isWithinBoundingX(_a) {
        var clientX = _a.clientX, rect = _a.rect;
        return clientX >= rect.left && clientX <= rect.right;
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    function getResizeEdges(_a) {
        var clientX = _a.clientX, clientY = _a.clientY, elm = _a.elm, allowedEdges = _a.allowedEdges, cursorPrecision = _a.cursorPrecision;
        /** @type {?} */
        var elmPosition = elm.nativeElement.getBoundingClientRect();
        /** @type {?} */
        var edges = {};
        if (allowedEdges.left &&
            isNumberCloseTo(clientX, elmPosition.left, cursorPrecision) &&
            isWithinBoundingY({ clientY: clientY, rect: elmPosition })) {
            edges.left = true;
        }
        if (allowedEdges.right &&
            isNumberCloseTo(clientX, elmPosition.right, cursorPrecision) &&
            isWithinBoundingY({ clientY: clientY, rect: elmPosition })) {
            edges.right = true;
        }
        if (allowedEdges.top &&
            isNumberCloseTo(clientY, elmPosition.top, cursorPrecision) &&
            isWithinBoundingX({ clientX: clientX, rect: elmPosition })) {
            edges.top = true;
        }
        if (allowedEdges.bottom &&
            isNumberCloseTo(clientY, elmPosition.bottom, cursorPrecision) &&
            isWithinBoundingX({ clientX: clientX, rect: elmPosition })) {
            edges.bottom = true;
        }
        return edges;
    }
    /** @type {?} */
    var DEFAULT_RESIZE_CURSORS = Object.freeze({
        topLeft: 'nw-resize',
        topRight: 'ne-resize',
        bottomLeft: 'sw-resize',
        bottomRight: 'se-resize',
        leftOrRight: 'col-resize',
        topOrBottom: 'row-resize'
    });
    /**
     * @param {?} edges
     * @param {?} cursors
     * @return {?}
     */
    function getResizeCursor(edges, cursors) {
        if (edges.left && edges.top) {
            return cursors.topLeft;
        }
        else if (edges.right && edges.top) {
            return cursors.topRight;
        }
        else if (edges.left && edges.bottom) {
            return cursors.bottomLeft;
        }
        else if (edges.right && edges.bottom) {
            return cursors.bottomRight;
        }
        else if (edges.left || edges.right) {
            return cursors.leftOrRight;
        }
        else if (edges.top || edges.bottom) {
            return cursors.topOrBottom;
        }
        else {
            return '';
        }
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    function getEdgesDiff(_a) {
        var edges = _a.edges, initialRectangle = _a.initialRectangle, newRectangle = _a.newRectangle;
        /** @type {?} */
        var edgesDiff = {};
        Object.keys(edges).forEach(function (edge) {
            edgesDiff[edge] = (newRectangle[edge] || 0) - (initialRectangle[edge] || 0);
        });
        return edgesDiff;
    }
    /** @type {?} */
    var RESIZE_ACTIVE_CLASS = 'resize-active';
    /** @type {?} */
    var RESIZE_LEFT_HOVER_CLASS = 'resize-left-hover';
    /** @type {?} */
    var RESIZE_RIGHT_HOVER_CLASS = 'resize-right-hover';
    /** @type {?} */
    var RESIZE_TOP_HOVER_CLASS = 'resize-top-hover';
    /** @type {?} */
    var RESIZE_BOTTOM_HOVER_CLASS = 'resize-bottom-hover';
    /** @type {?} */
    var RESIZE_GHOST_ELEMENT_CLASS = 'resize-ghost-element';
    /** @type {?} */
    var MOUSE_MOVE_THROTTLE_MS = 50;
    /**
     * Place this on an element to make it resizable. For example:
     *
     * ```html
     * <div
     *   mwlResizable
     *   [resizeEdges]="{bottom: true, right: true, top: true, left: true}"
     *   [enableGhostResize]="true">
     * </div>
     * ```
     */
    var ResizableDirective = /** @class */ (function () {
        /**
         * @hidden
         */
        function ResizableDirective(platformId, renderer, elm, zone) {
            this.platformId = platformId;
            this.renderer = renderer;
            this.elm = elm;
            this.zone = zone;
            /**
             * The edges that an element can be resized from. Pass an object like `{top: true, bottom: false}`. By default no edges can be resized.
             * @deprecated use a resize handle instead that positions itself to the side of the element you would like to resize
             */
            this.resizeEdges = {};
            /**
             * Set to `true` to enable a temporary resizing effect of the element in between the `resizeStart` and `resizeEnd` events.
             */
            this.enableGhostResize = false;
            /**
             * A snap grid that resize events will be locked to.
             *
             * e.g. to only allow the element to be resized every 10px set it to `{left: 10, right: 10}`
             */
            this.resizeSnapGrid = {};
            /**
             * The mouse cursors that will be set on the resize edges
             */
            this.resizeCursors = DEFAULT_RESIZE_CURSORS;
            /**
             * Mouse over thickness to active cursor.
             * @deprecated invalid when you migrate to use resize handles instead of setting resizeEdges on the element
             */
            this.resizeCursorPrecision = 3;
            /**
             * Define the positioning of the ghost element (can be fixed or absolute)
             */
            this.ghostElementPositioning = 'fixed';
            /**
             * Allow elements to be resized to negative dimensions
             */
            this.allowNegativeResizes = false;
            /**
             * Called when the mouse is pressed and a resize event is about to begin. `$event` is a `ResizeEvent` object.
             */
            this.resizeStart = new core.EventEmitter();
            /**
             * Called as the mouse is dragged after a resize event has begun. `$event` is a `ResizeEvent` object.
             */
            this.resizing = new core.EventEmitter();
            /**
             * Called after the mouse is released after a resize event. `$event` is a `ResizeEvent` object.
             */
            this.resizeEnd = new core.EventEmitter();
            /**
             * @hidden
             */
            this.mouseup = new rxjs.Subject();
            /**
             * @hidden
             */
            this.mousedown = new rxjs.Subject();
            /**
             * @hidden
             */
            this.mousemove = new rxjs.Subject();
            this.destroy$ = new rxjs.Subject();
            this.resizeEdges$ = new rxjs.Subject();
            this.pointerEventListeners = PointerEventListeners.getInstance(renderer, zone);
        }
        /**
         * @hidden
         */
        /**
         * @hidden
         * @return {?}
         */
        ResizableDirective.prototype.ngOnInit = /**
         * @hidden
         * @return {?}
         */
            function () {
                var _this = this;
                // TODO - use some fancy Observable.merge's for this
                this.pointerEventListeners.pointerDown
                    .pipe(operators.takeUntil(this.destroy$))
                    .subscribe(function (_a) {
                    var clientX = _a.clientX, clientY = _a.clientY;
                    _this.mousedown.next({ clientX: clientX, clientY: clientY });
                });
                this.pointerEventListeners.pointerMove
                    .pipe(operators.takeUntil(this.destroy$))
                    .subscribe(function (_a) {
                    var clientX = _a.clientX, clientY = _a.clientY, event = _a.event;
                    _this.mousemove.next({ clientX: clientX, clientY: clientY, event: event });
                });
                this.pointerEventListeners.pointerUp
                    .pipe(operators.takeUntil(this.destroy$))
                    .subscribe(function (_a) {
                    var clientX = _a.clientX, clientY = _a.clientY;
                    _this.mouseup.next({ clientX: clientX, clientY: clientY });
                });
                /** @type {?} */
                var currentResize;
                /** @type {?} */
                var removeGhostElement = function () {
                    if (currentResize && currentResize.clonedNode) {
                        _this.elm.nativeElement.parentElement.removeChild(currentResize.clonedNode);
                        _this.renderer.setStyle(_this.elm.nativeElement, 'visibility', 'inherit');
                    }
                };
                /** @type {?} */
                var getResizeCursors = function () {
                    return __assign({}, DEFAULT_RESIZE_CURSORS, _this.resizeCursors);
                };
                /** @type {?} */
                var mouseMove = this.mousemove.pipe(operators.share());
                mouseMove.pipe(operators.filter(function () { return !!currentResize; })).subscribe(function (_a) {
                    var event = _a.event;
                    event.preventDefault();
                });
                this.resizeEdges$
                    .pipe(operators.startWith(this.resizeEdges), operators.map(function () {
                    return (_this.resizeEdges &&
                        Object.keys(_this.resizeEdges).some(function (edge) { return !!_this.resizeEdges[edge]; }));
                }), operators.switchMap(function (legacyResizeEdgesEnabled) {
                    return legacyResizeEdgesEnabled ? mouseMove : rxjs.EMPTY;
                }), operators.auditTime(MOUSE_MOVE_THROTTLE_MS))
                    .subscribe(function (_a) {
                    var clientX = _a.clientX, clientY = _a.clientY;
                    /** @type {?} */
                    var resizeEdges = getResizeEdges({
                        clientX: clientX,
                        clientY: clientY,
                        elm: _this.elm,
                        allowedEdges: _this.resizeEdges,
                        cursorPrecision: _this.resizeCursorPrecision
                    });
                    /** @type {?} */
                    var resizeCursors = getResizeCursors();
                    if (!currentResize) {
                        /** @type {?} */
                        var cursor = getResizeCursor(resizeEdges, resizeCursors);
                        _this.renderer.setStyle(_this.elm.nativeElement, 'cursor', cursor);
                    }
                    _this.setElementClass(_this.elm, RESIZE_LEFT_HOVER_CLASS, resizeEdges.left === true);
                    _this.setElementClass(_this.elm, RESIZE_RIGHT_HOVER_CLASS, resizeEdges.right === true);
                    _this.setElementClass(_this.elm, RESIZE_TOP_HOVER_CLASS, resizeEdges.top === true);
                    _this.setElementClass(_this.elm, RESIZE_BOTTOM_HOVER_CLASS, resizeEdges.bottom === true);
                });
                /** @type {?} */
                var mousedrag = this.mousedown
                    .pipe(operators.mergeMap(function (startCoords) {
                    /**
                     * @param {?} moveCoords
                     * @return {?}
                     */
                    function getDiff(moveCoords) {
                        return {
                            clientX: moveCoords.clientX - startCoords.clientX,
                            clientY: moveCoords.clientY - startCoords.clientY
                        };
                    }
                    /** @type {?} */
                    var getSnapGrid = function () {
                        /** @type {?} */
                        var snapGrid = { x: 1, y: 1 };
                        if (currentResize) {
                            if (_this.resizeSnapGrid.left && currentResize.edges.left) {
                                snapGrid.x = +_this.resizeSnapGrid.left;
                            }
                            else if (_this.resizeSnapGrid.right &&
                                currentResize.edges.right) {
                                snapGrid.x = +_this.resizeSnapGrid.right;
                            }
                            if (_this.resizeSnapGrid.top && currentResize.edges.top) {
                                snapGrid.y = +_this.resizeSnapGrid.top;
                            }
                            else if (_this.resizeSnapGrid.bottom &&
                                currentResize.edges.bottom) {
                                snapGrid.y = +_this.resizeSnapGrid.bottom;
                            }
                        }
                        return snapGrid;
                    };
                    /**
                     * @param {?} coords
                     * @param {?} snapGrid
                     * @return {?}
                     */
                    function getGrid(coords, snapGrid) {
                        return {
                            x: Math.ceil(coords.clientX / snapGrid.x),
                            y: Math.ceil(coords.clientY / snapGrid.y)
                        };
                    }
                    return rxjs.merge(mouseMove.pipe(operators.take(1)).pipe(operators.map(function (coords) { return [coords]; })), mouseMove.pipe(operators.pairwise()))
                        .pipe(operators.map(function (_a) {
                        var _b = __read(_a, 2), previousCoords = _b[0], newCoords = _b[1];
                        return [
                            previousCoords ? getDiff(previousCoords) : previousCoords,
                            getDiff(newCoords)
                        ];
                    }))
                        .pipe(operators.filter(function (_a) {
                        var _b = __read(_a, 2), previousCoords = _b[0], newCoords = _b[1];
                        if (!previousCoords) {
                            return true;
                        }
                        /** @type {?} */
                        var snapGrid = getSnapGrid();
                        /** @type {?} */
                        var previousGrid = getGrid(previousCoords, snapGrid);
                        /** @type {?} */
                        var newGrid = getGrid(newCoords, snapGrid);
                        return (previousGrid.x !== newGrid.x || previousGrid.y !== newGrid.y);
                    }))
                        .pipe(operators.map(function (_a) {
                        var _b = __read(_a, 2), newCoords = _b[1];
                        /** @type {?} */
                        var snapGrid = getSnapGrid();
                        return {
                            clientX: Math.round(newCoords.clientX / snapGrid.x) * snapGrid.x,
                            clientY: Math.round(newCoords.clientY / snapGrid.y) * snapGrid.y
                        };
                    }))
                        .pipe(operators.takeUntil(rxjs.merge(_this.mouseup, _this.mousedown)));
                }))
                    .pipe(operators.filter(function () { return !!currentResize; }));
                mousedrag
                    .pipe(operators.map(function (_a) {
                    var clientX = _a.clientX, clientY = _a.clientY;
                    return getNewBoundingRectangle(( /** @type {?} */(currentResize)).startingRect, ( /** @type {?} */(currentResize)).edges, clientX, clientY);
                }))
                    .pipe(operators.filter(function (newBoundingRect) {
                    return (_this.allowNegativeResizes ||
                        !!(newBoundingRect.height &&
                            newBoundingRect.width &&
                            newBoundingRect.height > 0 &&
                            newBoundingRect.width > 0));
                }))
                    .pipe(operators.filter(function (newBoundingRect) {
                    return _this.validateResize
                        ? _this.validateResize({
                            rectangle: newBoundingRect,
                            edges: getEdgesDiff({
                                edges: ( /** @type {?} */(currentResize)).edges,
                                initialRectangle: ( /** @type {?} */(currentResize)).startingRect,
                                newRectangle: newBoundingRect
                            })
                        })
                        : true;
                }))
                    .subscribe(function (newBoundingRect) {
                    if (currentResize && currentResize.clonedNode) {
                        _this.renderer.setStyle(currentResize.clonedNode, 'height', newBoundingRect.height + "px");
                        _this.renderer.setStyle(currentResize.clonedNode, 'width', newBoundingRect.width + "px");
                        _this.renderer.setStyle(currentResize.clonedNode, 'top', newBoundingRect.top + "px");
                        _this.renderer.setStyle(currentResize.clonedNode, 'left', newBoundingRect.left + "px");
                    }
                    _this.zone.run(function () {
                        _this.resizing.emit({
                            edges: getEdgesDiff({
                                edges: ( /** @type {?} */(currentResize)).edges,
                                initialRectangle: ( /** @type {?} */(currentResize)).startingRect,
                                newRectangle: newBoundingRect
                            }),
                            rectangle: newBoundingRect
                        });
                    });
                    ( /** @type {?} */(currentResize)).currentRect = newBoundingRect;
                });
                this.mousedown
                    .pipe(operators.map(function (_a) {
                    var clientX = _a.clientX, clientY = _a.clientY, edges = _a.edges;
                    return (edges ||
                        getResizeEdges({
                            clientX: clientX,
                            clientY: clientY,
                            elm: _this.elm,
                            allowedEdges: _this.resizeEdges,
                            cursorPrecision: _this.resizeCursorPrecision
                        }));
                }))
                    .pipe(operators.filter(function (edges) {
                    return Object.keys(edges).length > 0;
                }))
                    .subscribe(function (edges) {
                    if (currentResize) {
                        removeGhostElement();
                    }
                    /** @type {?} */
                    var startingRect = getElementRect(_this.elm, _this.ghostElementPositioning);
                    currentResize = {
                        edges: edges,
                        startingRect: startingRect,
                        currentRect: startingRect
                    };
                    /** @type {?} */
                    var resizeCursors = getResizeCursors();
                    /** @type {?} */
                    var cursor = getResizeCursor(currentResize.edges, resizeCursors);
                    _this.renderer.setStyle(document.body, 'cursor', cursor);
                    _this.setElementClass(_this.elm, RESIZE_ACTIVE_CLASS, true);
                    if (_this.enableGhostResize) {
                        currentResize.clonedNode = _this.elm.nativeElement.cloneNode(true);
                        _this.elm.nativeElement.parentElement.appendChild(currentResize.clonedNode);
                        _this.renderer.setStyle(_this.elm.nativeElement, 'visibility', 'hidden');
                        _this.renderer.setStyle(currentResize.clonedNode, 'position', _this.ghostElementPositioning);
                        _this.renderer.setStyle(currentResize.clonedNode, 'left', currentResize.startingRect.left + "px");
                        _this.renderer.setStyle(currentResize.clonedNode, 'top', currentResize.startingRect.top + "px");
                        _this.renderer.setStyle(currentResize.clonedNode, 'height', currentResize.startingRect.height + "px");
                        _this.renderer.setStyle(currentResize.clonedNode, 'width', currentResize.startingRect.width + "px");
                        _this.renderer.setStyle(currentResize.clonedNode, 'cursor', getResizeCursor(currentResize.edges, resizeCursors));
                        _this.renderer.addClass(currentResize.clonedNode, RESIZE_GHOST_ELEMENT_CLASS);
                        ( /** @type {?} */(currentResize.clonedNode)).scrollTop = ( /** @type {?} */(currentResize.startingRect
                            .scrollTop));
                        ( /** @type {?} */(currentResize.clonedNode)).scrollLeft = ( /** @type {?} */(currentResize.startingRect
                            .scrollLeft));
                    }
                    _this.zone.run(function () {
                        _this.resizeStart.emit({
                            edges: getEdgesDiff({
                                edges: edges,
                                initialRectangle: startingRect,
                                newRectangle: startingRect
                            }),
                            rectangle: getNewBoundingRectangle(startingRect, {}, 0, 0)
                        });
                    });
                });
                this.mouseup.subscribe(function () {
                    if (currentResize) {
                        _this.renderer.removeClass(_this.elm.nativeElement, RESIZE_ACTIVE_CLASS);
                        _this.renderer.setStyle(document.body, 'cursor', '');
                        _this.renderer.setStyle(_this.elm.nativeElement, 'cursor', '');
                        _this.zone.run(function () {
                            _this.resizeEnd.emit({
                                edges: getEdgesDiff({
                                    edges: ( /** @type {?} */(currentResize)).edges,
                                    initialRectangle: ( /** @type {?} */(currentResize)).startingRect,
                                    newRectangle: ( /** @type {?} */(currentResize)).currentRect
                                }),
                                rectangle: ( /** @type {?} */(currentResize)).currentRect
                            });
                        });
                        removeGhostElement();
                        currentResize = null;
                    }
                });
            };
        /**
         * @hidden
         */
        /**
         * @hidden
         * @param {?} changes
         * @return {?}
         */
        ResizableDirective.prototype.ngOnChanges = /**
         * @hidden
         * @param {?} changes
         * @return {?}
         */
            function (changes) {
                if (changes.resizeEdges) {
                    this.resizeEdges$.next(this.resizeEdges);
                }
            };
        /**
         * @hidden
         */
        /**
         * @hidden
         * @return {?}
         */
        ResizableDirective.prototype.ngOnDestroy = /**
         * @hidden
         * @return {?}
         */
            function () {
                // browser check for angular universal, because it doesn't know what document is
                if (common.isPlatformBrowser(this.platformId)) {
                    this.renderer.setStyle(document.body, 'cursor', '');
                }
                this.mousedown.complete();
                this.mouseup.complete();
                this.mousemove.complete();
                this.resizeEdges$.complete();
                this.destroy$.next();
            };
        /**
         * @private
         * @param {?} elm
         * @param {?} name
         * @param {?} add
         * @return {?}
         */
        ResizableDirective.prototype.setElementClass = /**
         * @private
         * @param {?} elm
         * @param {?} name
         * @param {?} add
         * @return {?}
         */
            function (elm, name, add) {
                if (add) {
                    this.renderer.addClass(elm.nativeElement, name);
                }
                else {
                    this.renderer.removeClass(elm.nativeElement, name);
                }
            };
        ResizableDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[mwlResizable]'
                    },] }
        ];
        /** @nocollapse */
        ResizableDirective.ctorParameters = function () {
            return [
                { type: undefined, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] }] },
                { type: core.Renderer2 },
                { type: core.ElementRef },
                { type: core.NgZone }
            ];
        };
        ResizableDirective.propDecorators = {
            validateResize: [{ type: core.Input }],
            resizeEdges: [{ type: core.Input }],
            enableGhostResize: [{ type: core.Input }],
            resizeSnapGrid: [{ type: core.Input }],
            resizeCursors: [{ type: core.Input }],
            resizeCursorPrecision: [{ type: core.Input }],
            ghostElementPositioning: [{ type: core.Input }],
            allowNegativeResizes: [{ type: core.Input }],
            resizeStart: [{ type: core.Output }],
            resizing: [{ type: core.Output }],
            resizeEnd: [{ type: core.Output }]
        };
        return ResizableDirective;
    }());
    var PointerEventListeners = /** @class */ (function () {
        function PointerEventListeners(renderer, zone) {
            this.pointerDown = new rxjs.Observable(function (observer) {
                /** @type {?} */
                var unsubscribeMouseDown;
                /** @type {?} */
                var unsubscribeTouchStart;
                zone.runOutsideAngular(function () {
                    unsubscribeMouseDown = renderer.listen('document', 'mousedown', function (event) {
                        observer.next({
                            clientX: event.clientX,
                            clientY: event.clientY,
                            event: event
                        });
                    });
                    unsubscribeTouchStart = renderer.listen('document', 'touchstart', function (event) {
                        observer.next({
                            clientX: event.touches[0].clientX,
                            clientY: event.touches[0].clientY,
                            event: event
                        });
                    });
                });
                return function () {
                    unsubscribeMouseDown();
                    unsubscribeTouchStart();
                };
            }).pipe(operators.share());
            this.pointerMove = new rxjs.Observable(function (observer) {
                /** @type {?} */
                var unsubscribeMouseMove;
                /** @type {?} */
                var unsubscribeTouchMove;
                zone.runOutsideAngular(function () {
                    unsubscribeMouseMove = renderer.listen('document', 'mousemove', function (event) {
                        observer.next({
                            clientX: event.clientX,
                            clientY: event.clientY,
                            event: event
                        });
                    });
                    unsubscribeTouchMove = renderer.listen('document', 'touchmove', function (event) {
                        observer.next({
                            clientX: event.targetTouches[0].clientX,
                            clientY: event.targetTouches[0].clientY,
                            event: event
                        });
                    });
                });
                return function () {
                    unsubscribeMouseMove();
                    unsubscribeTouchMove();
                };
            }).pipe(operators.share());
            this.pointerUp = new rxjs.Observable(function (observer) {
                /** @type {?} */
                var unsubscribeMouseUp;
                /** @type {?} */
                var unsubscribeTouchEnd;
                /** @type {?} */
                var unsubscribeTouchCancel;
                zone.runOutsideAngular(function () {
                    unsubscribeMouseUp = renderer.listen('document', 'mouseup', function (event) {
                        observer.next({
                            clientX: event.clientX,
                            clientY: event.clientY,
                            event: event
                        });
                    });
                    unsubscribeTouchEnd = renderer.listen('document', 'touchend', function (event) {
                        observer.next({
                            clientX: event.changedTouches[0].clientX,
                            clientY: event.changedTouches[0].clientY,
                            event: event
                        });
                    });
                    unsubscribeTouchCancel = renderer.listen('document', 'touchcancel', function (event) {
                        observer.next({
                            clientX: event.changedTouches[0].clientX,
                            clientY: event.changedTouches[0].clientY,
                            event: event
                        });
                    });
                });
                return function () {
                    unsubscribeMouseUp();
                    unsubscribeTouchEnd();
                    unsubscribeTouchCancel();
                };
            }).pipe(operators.share());
        }
        // tslint:disable-line
        /**
         * @param {?} renderer
         * @param {?} zone
         * @return {?}
         */
        PointerEventListeners.getInstance =
            // tslint:disable-line
            /**
             * @param {?} renderer
             * @param {?} zone
             * @return {?}
             */
            function (renderer, zone) {
                if (!PointerEventListeners.instance) {
                    PointerEventListeners.instance = new PointerEventListeners(renderer, zone);
                }
                return PointerEventListeners.instance;
            };
        return PointerEventListeners;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
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
                    (( /** @type {?} */(_this))).eventListeners[type]();
                    delete _this.eventListeners[type];
                });
            };
        ResizeHandleDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: '[mwlResizeHandle]'
                    },] }
        ];
        /** @nocollapse */
        ResizeHandleDirective.ctorParameters = function () {
            return [
                { type: core.Renderer2 },
                { type: core.ElementRef },
                { type: core.NgZone },
                { type: ResizableDirective }
            ];
        };
        ResizeHandleDirective.propDecorators = {
            resizeEdges: [{ type: core.Input }],
            onMousedown: [{ type: core.HostListener, args: ['touchstart', [
                            '$event',
                            '$event.touches[0].clientX',
                            '$event.touches[0].clientY'
                        ],] }, { type: core.HostListener, args: ['mousedown', ['$event', '$event.clientX', '$event.clientY'],] }],
            onMouseup: [{ type: core.HostListener, args: ['touchend', [
                            '$event.changedTouches[0].clientX',
                            '$event.changedTouches[0].clientY'
                        ],] }, { type: core.HostListener, args: ['touchcancel', [
                            '$event.changedTouches[0].clientX',
                            '$event.changedTouches[0].clientY'
                        ],] }, { type: core.HostListener, args: ['mouseup', ['$event.clientX', '$event.clientY'],] }]
        };
        return ResizeHandleDirective;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var ResizableModule = /** @class */ (function () {
        function ResizableModule() {
        }
        ResizableModule.decorators = [
            { type: core.NgModule, args: [{
                        declarations: [ResizableDirective, ResizeHandleDirective],
                        exports: [ResizableDirective, ResizeHandleDirective]
                    },] }
        ];
        return ResizableModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.ResizableDirective = ResizableDirective;
    exports.ResizeHandleDirective = ResizeHandleDirective;
    exports.ResizableModule = ResizableModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=angular-resizable-element.umd.js.map