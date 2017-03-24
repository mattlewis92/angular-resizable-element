# angular resizable element
[![Build Status](https://travis-ci.org/mattlewis92/angular-resizable-element.svg?branch=master)](https://travis-ci.org/mattlewis92/angular-resizable-element)
[![codecov](https://codecov.io/gh/mattlewis92/angular-resizable-element/branch/master/graph/badge.svg)](https://codecov.io/gh/mattlewis92/angular-resizable-element)
[![npm version](https://badge.fury.io/js/angular-resizable-element.svg)](http://badge.fury.io/js/angular-resizable-element)
[![devDependency Status](https://david-dm.org/mattlewis92/angular-resizable-element/dev-status.svg)](https://david-dm.org/mattlewis92/angular-resizable-element?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/mattlewis92/angular-resizable-element.svg)](https://github.com/mattlewis92/angular-resizable-element/issues)
[![GitHub stars](https://img.shields.io/github/stars/mattlewis92/angular-resizable-element.svg)](https://github.com/mattlewis92/angular-resizable-element/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mattlewis92/angular-resizable-element/master/LICENSE)

## Demo
https://mattlewis92.github.io/angular-resizable-element/demo/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#licence)

## About

An angular 4.0+ directive that allows an element to be dragged and resized

## Installation

Install through npm:
```
npm install --save angular-resizable-element
```

Then use it in your app like so:

```typescript
import {Component} from '@angular/core';
import {ResizeEvent} from 'angular-resizable-element';

@Component({
  selector: 'demo-app',
  // you should add some styles to the element. See the demo folder for a more fleshed out example
  template: `
    <div
      mwlResizable
      [enableGhostResize]="true"
      [resizeEdges]="{bottom: true, right: true, top: true, left: true}"
      (resizeEnd)="onResizeEnd($event)">
    </div>
  `
})
export class MyComponent {

  onResizeEnd(event: ResizeEvent): void {
    console.log('Element was resized', event);
  }

}

// now use within your apps module
import {NgModule} from '@angular/core';
import {ResizableModule} from 'angular-resizable-element';

@NgModule({
  declarations: [MyComponent],
  imports: [ResizableModule],
  bootstrap: [MyComponent]
})
class MyModule {}

```

You may also find it useful to view the [demo source](https://github.com/mattlewis92/angular-resizable-element/blob/master/demo/demo.component.ts).

### Usage without a module bundler
```
<script src="node_modules/angular-resizable-element/angular-resizable-element.js"></script>
<script>
    // everything is exported on the  angularResizableElement namespace
</script>
```

## Documentation
All documentation is auto-generated from the source and can be viewed here:
https://mattlewis92.github.io/angular-resizable-element/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM (should come with)
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` to start a development server on port 8000 with auto reload + tests.

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
```bash
npm run release
```

## License

MIT
