const globals = {
  '@angular/core': 'ng.core',
  'rxjs/Subject': 'Rx',
  'rxjs/Observable': 'Rx',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/observable/interval': 'Rx.Observable',
  'rxjs/add/operator/map': 'Rx.Observable.prototype',
  'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
  'rxjs/add/operator/takeUntil': 'Rx.Observable.prototype',
  'rxjs/add/operator/filter': 'Rx.Observable.prototype',
  'rxjs/add/operator/pairwise': 'Rx.Observable.prototype',
  'rxjs/add/operator/take': 'Rx.Observable.prototype',
  'rxjs/add/operator/throttle': 'Rx.Observable.prototype',
  'rxjs/add/operator/share': 'Rx.Observable.prototype',
};

export default {
  input: 'dist/esm/src/angular-resizable-element.js',
  external: Object.keys(globals),
  output: {
    file: 'dist/esm/angular-resizable-element.js',
    format: 'es',
    globals: globals,
    sourcemap: true,
  }
}
