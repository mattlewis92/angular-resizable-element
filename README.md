# angular2 resizable
[![Build Status](https://travis-ci.org/mattlewis92/angular2-resizable.svg?branch=master)](https://travis-ci.org/mattlewis92/angular2-resizable)
[![npm version](https://badge.fury.io/js/angular2-resizable.svg)](http://badge.fury.io/js/angular2-resizable)
[![devDependency Status](https://david-dm.org/mattlewis92/angular2-resizable/dev-status.svg)](https://david-dm.org/mattlewis92/angular2-resizable#info=devDependencies)
[![GitHub issues](https://img.shields.io/github/issues/mattlewis92/angular2-resizable.svg)](https://github.com/mattlewis92/angular2-resizable/issues)
[![GitHub stars](https://img.shields.io/github/stars/mattlewis92/angular2-resizable.svg)](https://github.com/mattlewis92/angular2-resizable/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mattlewis92/angular2-resizable/master/LICENSE)

## Demo
https://mattlewis92.github.io/angular2-resizable/demo/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#licence)

## About

An angular2 directive that allows an element to be dragged and resized

## Installation

Install through npm:
```
npm install --save angular2-resizable
```

Then use it in your app like so:

```typescript
import {Component} from '@angular/core';
import {Resizable} from 'angular2-resizable';

@Component({
  selector: 'demo-app',
  directives: [Resizable],
  // you should add some styles to the element. See the demo folder for a more fleshed out example
  template: '<div mwl-resizable (onResizeEnd)="onResizeEnd($event)"></div>'
})
export class DemoApp {

  onResizeEnd(event: any): void {
    console.log('Element was resized', event);
  }

}

```

You may also find it useful to view the [demo source](https://github.com/mattlewis92/angular2-resizable/blob/master/demo/demo.ts).

### Usage without a module bundler
```
<script src="node_modules/angular2-resizable/angular2-resizable.js"></script>
<script>
    // everything is exported on the  angular2Resizable namespace
</script>
```

## Documentation
All documentation is auto-generated from the source via typedoc and can be viewed here:
https://mattlewis92.github.io/angular2-resizable/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM (should come with)
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` to start a development server on port 8000 with auto reload + tests. 

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
* Bump the version in package.json (once the module hits 1.0 this will become automatic)
```bash
npm run release
```

## License

MIT
