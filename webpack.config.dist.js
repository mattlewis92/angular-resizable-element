module.exports = {
  entry: './angular2-resizable.ts',
  output: {
    filename: './angular2-resizable.js',
    libraryTarget: 'umd',
    library: 'angular2Resizable'
  },
  externals: {
    '@angular/core': {
      root: ['ng', 'core'],
      commonjs: '@angular/core',
      commonjs2: '@angular/core',
      amd: '@angular/core'
    },
    '@angular/common': {
      root: ['ng', 'common'],
      commonjs: '@angular/common',
      commonjs2: '@angular/common',
      amd: '@angular/common'
    },
    'rxjs/Subject': {
      root: ['rx', 'Subject'],
      commonjs: 'rxjs/Subject',
      commonjs2: 'rxjs/Subject',
      amd: 'rxjs/Subject'
    },
    'rxjs/Observable': {
      root: ['rx', 'Observable'],
      commonjs: 'rxjs/Observable',
      commonjs2: 'rxjs/Observable',
      amd: 'rxjs/Observable'
    },
    'rxjs/observable/merge': {
      root: ['rx', 'Observable', 'merge'],
      commonjs: 'rxjs/observable/merge',
      commonjs2: 'rxjs/observable/merge',
      amd: 'rxjs/observable/merge'
    },
    'rxjs/add/operator/map': {
      root: ['rx', 'Observable'],
      commonjs: 'rxjs/operator/map',
      commonjs2: 'rxjs/operator/map',
      amd: 'rxjs/operator/map'
    },
    'rxjs/add/operator/mergeMap': {
      root: ['rx', 'Observable'],
      commonjs: 'rxjs/operator/mergeMap',
      commonjs2: 'rxjs/operator/mergeMap',
      amd: 'rxjs/operator/mergeMap'
    },
    'rxjs/add/operator/takeUntil': {
      root: ['rx', 'Observable'],
      commonjs: 'rxjs/operator/takeUntil',
      commonjs2: 'rxjs/operator/takeUntil',
      amd: 'rxjs/operator/takeUntil'
    },
    'rxjs/add/operator/filter': {
      root: ['rx', 'Observable'],
      commonjs: 'rxjs/operator/filter',
      commonjs2: 'rxjs/operator/filter',
      amd: 'rxjs/operator/filter'
    },
    'rxjs/add/operator/pairwise': {
      root: ['rx', 'Observable'],
      commonjs: 'rxjs/operator/pairwise',
      commonjs2: 'rxjs/operator/pairwise',
      amd: 'rxjs/operator/pairwise'
    },
    'rxjs/add/operator/take': {
      root: ['rx', 'Observable'],
      commonjs: 'rxjs/operator/take',
      commonjs2: 'rxjs/operator/take',
      amd: 'rxjs/operator/take'
    }
  },
  devtool: 'source-map',
  module: {
    preLoaders: [{
      test: /\.ts$/, loader: 'tslint?emitErrors=true&failOnHint=true', exclude: /node_modules/
    }],
    loaders: [{
      test: /\.ts$/, loader: 'ts', exclude: /node_modules/,
      query: {
        compilerOptions: {
          declaration: true
        }
      }
    }]
  },
  resolve: {
    extensions: ['', '.ts', '.js']
  }
};
