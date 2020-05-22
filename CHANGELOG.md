# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.3.2"></a>
## [3.3.2](https://github.com/mattlewis92/angular-resizable-element/compare/v3.3.1...v3.3.2) (2020-05-22)


### Bug Fixes

* allow any angular version above 6 ([66f2289](https://github.com/mattlewis92/angular-resizable-element/commit/66f2289))



<a name="3.3.1"></a>
## [3.3.1](https://github.com/mattlewis92/angular-resizable-element/compare/v3.3.0...v3.3.1) (2020-05-22)


### Bug Fixes

* handle translate3d transforms on resizable elements ([534bdf6](https://github.com/mattlewis92/angular-resizable-element/commit/534bdf6)), closes [#100](https://github.com/mattlewis92/angular-resizable-element/issues/100)



<a name="3.3.0"></a>
# [3.3.0](https://github.com/mattlewis92/angular-resizable-element/compare/v3.2.6...v3.3.0) (2020-01-14)


### Features

* allow changing mouseMoveThrottleMS ([#106](https://github.com/mattlewis92/angular-resizable-element/issues/106)) ([fb5599b](https://github.com/mattlewis92/angular-resizable-element/commit/fb5599b))



<a name="3.2.6"></a>
## [3.2.6](https://github.com/mattlewis92/angular-resizable-element/compare/v3.2.5...v3.2.6) (2019-10-11)


### Bug Fixes

* allow angular 9 peer dependency ([86e366c](https://github.com/mattlewis92/angular-resizable-element/commit/86e366c))



<a name="3.2.5"></a>
## [3.2.5](https://github.com/mattlewis92/angular-resizable-element/compare/v3.2.4...v3.2.5) (2019-10-07)


### Performance Improvements

* lazily initialise all mousemove listeners until needed ([81134ee](https://github.com/mattlewis92/angular-resizable-element/commit/81134ee))



<a name="3.2.4"></a>
## [3.2.4](https://github.com/mattlewis92/angular-resizable-element/compare/v3.2.3...v3.2.4) (2019-02-28)


### Bug Fixes

* restore compatibility with universal ([210decc](https://github.com/mattlewis92/angular-resizable-element/commit/210decc)), closes [#83](https://github.com/mattlewis92/angular-resizable-element/issues/83)



<a name="3.2.3"></a>
## [3.2.3](https://github.com/mattlewis92/angular-resizable-element/compare/v3.2.2...v3.2.3) (2019-02-05)


### Bug Fixes

* allow angular 8 peer dependency ([94dc48d](https://github.com/mattlewis92/angular-resizable-element/commit/94dc48d))
* deprecate the top level resizeEdges option in favour of resize handles ([2f6ac2d](https://github.com/mattlewis92/angular-resizable-element/commit/2f6ac2d))


### Performance Improvements

* remove mouse move listeners when only using resize handles ([1185f3a](https://github.com/mattlewis92/angular-resizable-element/commit/1185f3a))



<a name="3.2.2"></a>
## [3.2.2](https://github.com/mattlewis92/angular-resizable-element/compare/v3.2.1...v3.2.2) (2018-08-10)


### Bug Fixes

* don't throw errors when immediately destroying the host component ([56e463b](https://github.com/mattlewis92/angular-resizable-element/commit/56e463b))



<a name="3.2.1"></a>
## [3.2.1](https://github.com/mattlewis92/angular-resizable-element/compare/v3.2.0...v3.2.1) (2018-08-03)


### Bug Fixes

* ensure all resizing events are always emitted ([25d6fa3](https://github.com/mattlewis92/angular-resizable-element/commit/25d6fa3))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/mattlewis92/angular-resizable-element/compare/v3.1.0...v3.2.0) (2018-07-23)


### Features

* allow negative resizing of elements ([560bcb1](https://github.com/mattlewis92/angular-resizable-element/commit/560bcb1))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/mattlewis92/angular-resizable-element/compare/v3.0.0...v3.1.0) (2018-06-19)


### Features

* improve default resize cursors ([37fc88e](https://github.com/mattlewis92/angular-resizable-element/commit/37fc88e))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/mattlewis92/angular-resizable-element/compare/v2.0.0...v3.0.0) (2018-05-09)


### Features

* upgrade to angular 6 ([c7e3de6](https://github.com/mattlewis92/angular-resizable-element/commit/c7e3de6))


### BREAKING CHANGES

* angular 6 and rxjs 6 or higher are now required to use this package



<a name="2.0.0"></a>
# [2.0.0](https://github.com/mattlewis92/angular-resizable-element/compare/v1.2.5...v2.0.0) (2017-12-26)


### Features

* export directives with Directive suffix ([0440bbd](https://github.com/mattlewis92/angular-resizable-element/commit/0440bbd))
* upgrade to angular 5 ([5d6a576](https://github.com/mattlewis92/angular-resizable-element/commit/5d6a576))
* use lettable rxjs operators ([af7abf7](https://github.com/mattlewis92/angular-resizable-element/commit/af7abf7))
* use ng-packagr for bundling the package ([c4519a1](https://github.com/mattlewis92/angular-resizable-element/commit/c4519a1)), closes [#79](https://github.com/mattlewis92/angular-resizable-element/issues/79) [#80](https://github.com/mattlewis92/angular-resizable-element/issues/80)


### BREAKING CHANGES

* the global observable prototype is now no longer modified by this package, you must
import rxjs operators yourself. Also rxjs 5.5 or higher is now required to use this library
* The UMD entry point has changed from `angular-resizable-element/dist/umd/angular-resizable-element.js` to `angular-resizable-element/bundles/angular-resizable-element.umd.js`

System.js users will need to update their configs
* angular 5 or higher is now required to use this package
* The Resizable import is now ResizableDirective and ResizeHandle is now
ResizeHandleDirective



<a name="1.2.5"></a>
## [1.2.5](https://github.com/mattlewis92/angular-resizable-element/compare/v1.2.4...v1.2.5) (2017-12-26)


### Bug Fixes

* **resizeHandle:** allow handles to be dynamically shown ([34342aa](https://github.com/mattlewis92/angular-resizable-element/commit/34342aa)), closes [#68](https://github.com/mattlewis92/angular-resizable-element/issues/68)
* resize elements that have css transforms ([f24a746](https://github.com/mattlewis92/angular-resizable-element/commit/f24a746)), closes [#72](https://github.com/mattlewis92/angular-resizable-element/issues/72)
* set the resize cursor globally when resizing ([71d5a05](https://github.com/mattlewis92/angular-resizable-element/commit/71d5a05)), closes [#70](https://github.com/mattlewis92/angular-resizable-element/issues/70)



<a name="1.2.4"></a>
## [1.2.4](https://github.com/mattlewis92/angular-resizable-element/compare/v1.2.3...v1.2.4) (2017-10-21)


### Bug Fixes

* allow angular 5 peer dependency ([25cfe50](https://github.com/mattlewis92/angular-resizable-element/commit/25cfe50))



<a name="1.2.3"></a>
## [1.2.3](https://github.com/mattlewis92/angular-resizable-element/compare/v1.2.2...v1.2.3) (2017-09-28)


### Bug Fixes

* Add startingRect scroll position to cloned node. ([#66](https://github.com/mattlewis92/angular-resizable-element/issues/66)) ([a056154](https://github.com/mattlewis92/angular-resizable-element/commit/a056154))



<a name="1.2.2"></a>
## [1.2.2](https://github.com/mattlewis92/angular-resizable-element/compare/v1.2.1...v1.2.2) (2017-08-28)


### Bug Fixes

* ensure mouse event handlers are triggers outside of the angular zone ([23fc6e5](https://github.com/mattlewis92/angular-resizable-element/commit/23fc6e5)), closes [#65](https://github.com/mattlewis92/angular-resizable-element/issues/65)



<a name="1.2.1"></a>
## [1.2.1](https://github.com/mattlewis92/angular-resizable-element/compare/v1.2.0...v1.2.1) (2017-08-06)


### Bug Fixes

* **cursor:** change the cursor back to default on IE11 ([a0323e9](https://github.com/mattlewis92/angular-resizable-element/commit/a0323e9)), closes [#62](https://github.com/mattlewis92/angular-resizable-element/issues/62)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/mattlewis92/angular-resizable-element/compare/v1.1.2...v1.2.0) (2017-06-12)


### Features

* export Edges and BoundingRectangle interfaces for use within applications ([10051cd](https://github.com/mattlewis92/angular-resizable-element/commit/10051cd))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/mattlewis92/angular-resizable-element/compare/v1.1.1...v1.1.2) (2017-06-10)


### Bug Fixes

* **dragHandle:** fix drag handles on firefox ([1d15bb4](https://github.com/mattlewis92/angular-resizable-element/commit/1d15bb4)), closes [#54](https://github.com/mattlewis92/angular-resizable-element/issues/54)



<a name="1.1.1"></a>
## [1.1.1](https://github.com/mattlewis92/angular-resizable-element/compare/v1.1.0...v1.1.1) (2017-05-21)


### Bug Fixes

* set ghost element width and height on resize start ([be5d727](https://github.com/mattlewis92/angular-resizable-element/commit/be5d727)), closes [#53](https://github.com/mattlewis92/angular-resizable-element/issues/53)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/mattlewis92/angular-resizable-element/compare/v1.0.0...v1.1.0) (2017-05-12)


### Features

* add a class to the ghost element ([54be6b7](https://github.com/mattlewis92/angular-resizable-element/commit/54be6b7))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.8.1...v1.0.0) (2017-03-24)


### Features

* **ng4:** upgrade to angular 4 ([4c665d2](https://github.com/mattlewis92/angular-resizable-element/commit/4c665d2))


### BREAKING CHANGES

* **ng4:** angular 4.0 or higher is now required to use this library. The
[upgrade](http://angularjs.blogspot.co.uk/2017/03/angular-400-now-available.html) should be seamless
for most users.



<a name="0.8.1"></a>
## [0.8.1](https://github.com/mattlewis92/angular-resizable-element/compare/v0.8.0...v0.8.1) (2017-03-23)


### Performance Improvements

* throttle mousemove listener events ([05f7f7e](https://github.com/mattlewis92/angular-resizable-element/commit/05f7f7e))
* use shared mouse event listeners across all resizable instances ([2a4b102](https://github.com/mattlewis92/angular-resizable-element/commit/2a4b102))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.7.2...v0.8.0) (2017-03-16)


### Features

* **ghostElementPositioning:** allow ghost element positioning to be configured ([b77c9fc](https://github.com/mattlewis92/angular-resizable-element/commit/b77c9fc))
* expose Resizable and ResizeHandle directives ([3633040](https://github.com/mattlewis92/angular-resizable-element/commit/3633040))



<a name="0.7.2"></a>
## [0.7.2](https://github.com/mattlewis92/angular-resizable-element/compare/v0.7.0...v0.7.2) (2017-03-04)


### Bug Fixes

* relax peer dependency warning to allow angular 4 ([8232e66](https://github.com/mattlewis92/angular-resizable-element/commit/8232e66))


### Performance Improvements

* run all rezize events outside the angular zone ([820612e](https://github.com/mattlewis92/angular-resizable-element/commit/820612e))
* **resizable:** only register mouse move events when a rezize is active ([a74f9e2](https://github.com/mattlewis92/angular-resizable-element/commit/a74f9e2))
* **resizeHandle:** dynamically register mouse move event listener ([4b20cde](https://github.com/mattlewis92/angular-resizable-element/commit/4b20cde))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.6.1...v0.7.0) (2017-02-28)


### Features

* **cssClasses:** Gives classes to main element depend on state ([8e3f108](https://github.com/mattlewis92/angular-resizable-element/commit/8e3f108))
* **cursorPrecision:** allow cursor precision value to be edited ([3ce508d](https://github.com/mattlewis92/angular-resizable-element/commit/3ce508d))



<a name="0.6.1"></a>
## [0.6.1](https://github.com/mattlewis92/angular-resizable-element/compare/v0.6.0...v0.6.1) (2017-02-11)


### Bug Fixes

* **universal:** remove MouseEvent reference ([520abce](https://github.com/mattlewis92/angular-resizable-element/commit/520abce)), closes [#41](https://github.com/mattlewis92/angular-resizable-element/issues/41)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.7...v0.6.0) (2017-02-04)


### Features

* **resizeCursors:** allow resize cursors to be customised ([99d2f66](https://github.com/mattlewis92/angular-resizable-element/commit/99d2f66)), closes [#40](https://github.com/mattlewis92/angular-resizable-element/issues/40)



<a name="0.5.7"></a>
## [0.5.7](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.6...v0.5.7) (2017-01-30)


### Bug Fixes

* use correct touch event properties ([0ab7d40](https://github.com/mattlewis92/angular-resizable-element/commit/0ab7d40)), closes [#39](https://github.com/mattlewis92/angular-resizable-element/issues/39)



<a name="0.5.6"></a>
## [0.5.6](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.5...v0.5.6) (2017-01-25)


### Bug Fixes

* element should resize on touch events ([aa169c7](https://github.com/mattlewis92/angular-resizable-element/commit/aa169c7)), closes [#36](https://github.com/mattlewis92/angular-resizable-element/issues/36)



<a name="0.5.5"></a>
## [0.5.5](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.4...v0.5.5) (2017-01-11)


### Bug Fixes

* add width and height to cloned node ([75ce122](https://github.com/mattlewis92/angular-resizable-element/commit/75ce122)), closes [#31](https://github.com/mattlewis92/angular-resizable-element/issues/31)
* keep cursor while resizing ([93a5c4e](https://github.com/mattlewis92/angular-resizable-element/commit/93a5c4e)), closes [#33](https://github.com/mattlewis92/angular-resizable-element/issues/33)



<a name="0.5.4"></a>
## [0.5.4](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.3...v0.5.4) (2016-12-11)


### Bug Fixes

* **cursor:** reset the cursor instead of changing it to auto ([514851f](https://github.com/mattlewis92/angular-resizable-element/commit/514851f))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.2...v0.5.3) (2016-11-19)


### Bug Fixes

* unsubscribe all observables when the component is destroyed ([d5ea756](https://github.com/mattlewis92/angular-resizable-element/commit/d5ea756)), closes [#27](https://github.com/mattlewis92/angular-resizable-element/issues/27)



<a name="0.5.2"></a>
## [0.5.2](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.1...v0.5.2) (2016-11-05)


### Bug Fixes

* **aot:** aot compatibility ([9236e02](https://github.com/mattlewis92/angular-resizable-element/commit/9236e02))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/mattlewis92/angular-resizable-element/compare/v0.5.0...v0.5.1) (2016-11-03)


### Bug Fixes

* dont change the cursor when resizing an element ([697c52c](https://github.com/mattlewis92/angular-resizable-element/commit/697c52c)), closes [#24](https://github.com/mattlewis92/angular-resizable-element/issues/24)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.4.1...v0.5.0) (2016-10-29)


### Bug Fixes

* fix resizing via a drag handle ([5f7f468](https://github.com/mattlewis92/angular-resizable-element/commit/5f7f468))
* prevent text from being selected when resizing an element ([5571069](https://github.com/mattlewis92/angular-resizable-element/commit/5571069)), closes [#22](https://github.com/mattlewis92/angular-resizable-element/issues/22)


### Features

* rename the library from angular2-resizable to angular-resizable-element ([927235e](https://github.com/mattlewis92/angular-resizable-element/commit/927235e)), closes [#21](https://github.com/mattlewis92/angular-resizable-element/issues/21)
* rename the resize output to resizing ([9597986](https://github.com/mattlewis92/angular-resizable-element/commit/9597986)), closes [#20](https://github.com/mattlewis92/angular-resizable-element/issues/20)


### BREAKING CHANGES

* The library has been renamed to `angular-resizable-element`.

The UMD entry point has changed to
```
node_modules/angular-resizable-element/dist/umd/angular-resizable-element.js
```
* Before
```
(resize)="onResize($event)"
```

After:
```
(resizing)="onResizing($event)"
```



<a name="0.4.1"></a>
## [0.4.1](https://github.com/mattlewis92/angular-resizable-element/compare/v0.4.0...v0.4.1) (2016-09-28)


### Bug Fixes

* **typings:** dont include reference to core-js ([68dc84f](https://github.com/mattlewis92/angular-resizable-element/commit/68dc84f))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.3.3...v0.4.0) (2016-09-25)


### Features

* **build:** support offline template compilation ([f3fe12a](https://github.com/mattlewis92/angular-resizable-element/commit/f3fe12a))


### BREAKING CHANGES

* build: For System.js users the path to the UMD files has changed:

Before:
```
node_modules/angular2-resizable/angular2-resizable.js
```

After:
```
node_modules/angular2-resizable/dist/umd/angular2-resizable.js
```



<a name="0.3.3"></a>
## [0.3.3](https://github.com/mattlewis92/angular-resizable-element/compare/v0.3.2...v0.3.3) (2016-09-13)


### Bug Fixes

* **peerDependencies:** allow any versions of angular post RC5 ([cbe088f](https://github.com/mattlewis92/angular-resizable-element/commit/cbe088f))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/mattlewis92/angular-resizable-element/compare/v0.3.1...v0.3.2) (2016-09-03)


### Features

* **angular:** support RC6 ([d5b18cc](https://github.com/mattlewis92/angular-resizable-element/commit/d5b18cc))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/mattlewis92/angular-resizable-element/compare/v0.3.0...v0.3.1) (2016-08-25)


### Bug Fixes

* **rxjs:** use correct rxjs operator imports in dist ([858b3f8](https://github.com/mattlewis92/angular-resizable-element/commit/858b3f8)), closes [#16](https://github.com/mattlewis92/angular-resizable-element/issues/16)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.2.1...v0.3.0) (2016-08-12)


### Features

* **events:** rename all outputs to drop the on prefix ([9c76aac](https://github.com/mattlewis92/angular-resizable-element/commit/9c76aac))
* directive selectors are now camel case instead of dash case ([ffad2ca](https://github.com/mattlewis92/angular-resizable-element/commit/ffad2ca))
* upgrade to angular RC5 ([9557c0a](https://github.com/mattlewis92/angular-resizable-element/commit/9557c0a))


### BREAKING CHANGES

* `mwl-resizable` is now `mwlResizable` and `mwl-resize-handle` is now `mwlResizeHandle`
* Angular RC5 is now required

The Resizable and ResizeHandle directives are now no longer exported. Instead you must use the ResizableModule. See the readme or the demo app for an example of how to do this.
* events: The `onResizeStart` output has been renamed to `resizeStart`

The `onResize` output has been renamed to `resize`

The `onResizeEnd` output has been renamed to `resizeEnd`



<a name="0.2.1"></a>
## [0.2.1](https://github.com/mattlewis92/angular-resizable-element/compare/v0.2.0...v0.2.1) (2016-07-15)


### Bug Fixes

* **demo:** fix broken demo ([0a5bf11](https://github.com/mattlewis92/angular-resizable-element/commit/0a5bf11))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.1.0...v0.2.0) (2016-07-15)


### Bug Fixes

* create a clone of the ghost element instead of applying styling to the host ([fa73345](https://github.com/mattlewis92/angular-resizable-element/commit/fa73345)), closes [#15](https://github.com/mattlewis92/angular-resizable-element/issues/15)
* only resize when the cursor is within the bounding rectangle ([dedc3bb](https://github.com/mattlewis92/angular-resizable-element/commit/dedc3bb))


### BREAKING CHANGES

* `enableResizeStyling` has been renamed to `enableGhostResize`



<a name="0.1.0"></a>
# [0.1.0](https://github.com/mattlewis92/angular-resizable-element/compare/v0.0.3...v0.1.0) (2016-06-26)


### Bug Fixes

* **mousedrag:** cancel the previous mousedrag observable when starting a new drag ([149c1a4](https://github.com/mattlewis92/angular-resizable-element/commit/149c1a4)), closes [#9](https://github.com/mattlewis92/angular-resizable-element/issues/9)
* **onResizeEnd:** call with co-ordinates of last valid resize rather than where the mouse up event w ([eb314fd](https://github.com/mattlewis92/angular-resizable-element/commit/eb314fd))
* **onResizeStart:** ensure the starting rectangle is a POJO rather than a bounding rectangle ([81fe0b4](https://github.com/mattlewis92/angular-resizable-element/commit/81fe0b4))
* cancel mousedrag event when either a mouseup or mousedown event fires ([c76be59](https://github.com/mattlewis92/angular-resizable-element/commit/c76be59))
* disable dragging effects on resizable elements on webkit browsers ([59078e2](https://github.com/mattlewis92/angular-resizable-element/commit/59078e2))
* renamed directive selector from mwl-resizeable to mwl-resizable ([c60b3f5](https://github.com/mattlewis92/angular-resizable-element/commit/c60b3f5))


### Features

* **disableResize:** support completely disabling resizing an element ([9f9c54a](https://github.com/mattlewis92/angular-resizable-element/commit/9f9c54a)), closes [#13](https://github.com/mattlewis92/angular-resizable-element/issues/13)
* expose the amount each edge was resized on resize events ([d664038](https://github.com/mattlewis92/angular-resizable-element/commit/d664038)), closes [#11](https://github.com/mattlewis92/angular-resizable-element/issues/11)
* **enableResizeStyling:** make temporary resizing of the element opt-in by default so users can con ([4c59b05](https://github.com/mattlewis92/angular-resizable-element/commit/4c59b05)), closes [#5](https://github.com/mattlewis92/angular-resizable-element/issues/5)
* **resizeEdges:** allow the resize edges to be customised ([60c2e08](https://github.com/mattlewis92/angular-resizable-element/commit/60c2e08)), closes [#8](https://github.com/mattlewis92/angular-resizable-element/issues/8)
* **resizeHandles:** add support for nesting resize handles inside the element ([1af705a](https://github.com/mattlewis92/angular-resizable-element/commit/1af705a)), closes [#10](https://github.com/mattlewis92/angular-resizable-element/issues/10)
* **resizeSnapGrid:** allow resizing to fit to a snap grid ([74424ba](https://github.com/mattlewis92/angular-resizable-element/commit/74424ba)), closes [#3](https://github.com/mattlewis92/angular-resizable-element/issues/3)
* **validate:** provide a way for resize events to be validated ([4da938d](https://github.com/mattlewis92/angular-resizable-element/commit/4da938d)), closes [#12](https://github.com/mattlewis92/angular-resizable-element/issues/12)


### BREAKING CHANGES

* enableResizeStyling: the element will no longer have its styles changed by default when dragging and
resizing. You can now re-enable it by setting `[enableResizeStyling]="true"` on the element.
* the `$event.edges` object values now contain numbers instead of booleans
* - rename the directive from mwl-resizeable to mwl-resizable
* resizeEdges: by default the element is no longer resizable.

You must specify `[resizeEdges]={top: true, bottom: true, left: true, right: true}` to get the old behaviour back



<a name="0.0.3"></a>
## [0.0.3](https://github.com/mattlewis92/angular-resizable-element/compare/v0.0.2...v0.0.3) (2016-06-13)


### Bug Fixes

* import missing rxjs operators ([300ac10](https://github.com/mattlewis92/angular-resizable-element/commit/300ac10))



<a name="0.0.2"></a>
## [0.0.2](https://github.com/mattlewis92/angular-resizable-element/compare/v0.0.1...v0.0.2) (2016-06-13)


### Bug Fixes

* **types:** export Edges and BoundingRectangle types ([fe49114](https://github.com/mattlewis92/angular-resizable-element/commit/fe49114))
* dont bundle rxjs with the library ([7b1280e](https://github.com/mattlewis92/angular-resizable-element/commit/7b1280e))



<a name="0.0.1"></a>
## 0.0.1 (2016-06-13)


### Bug Fixes

* allow the element to be resized multiple times ([bf497d2](https://github.com/mattlewis92/angular-resizable-element/commit/bf497d2))
* **drag:** disable user dragging ([053fb0e](https://github.com/mattlewis92/angular-resizable-element/commit/053fb0e))
* reset element styles on mousedown if there was a previous uncancelled resize ([a8e5cd3](https://github.com/mattlewis92/angular-resizable-element/commit/a8e5cd3))
* **outputs:** make outputs sync to prevent ui flicker ([032ea5a](https://github.com/mattlewis92/angular-resizable-element/commit/032ea5a))
* **typescript:** add missing types ([e722a86](https://github.com/mattlewis92/angular-resizable-element/commit/e722a86))


### Features

* improve transforms, add resize events ([0959a12](https://github.com/mattlewis92/angular-resizable-element/commit/0959a12))
* initial WIP resizable implementation ([22af52f](https://github.com/mattlewis92/angular-resizable-element/commit/22af52f))
* show the cursor when mousing over the edge of the element ([f440c87](https://github.com/mattlewis92/angular-resizable-element/commit/f440c87))
* support resizing from corners ([bac87e3](https://github.com/mattlewis92/angular-resizable-element/commit/bac87e3)), closes [#4](https://github.com/mattlewis92/angular-resizable-element/issues/4)
