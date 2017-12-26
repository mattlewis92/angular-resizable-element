import * as webpack from 'webpack';

const angularExternals = require('webpack-angular-externals');
const rxjsExternals = require('webpack-rxjs-externals');

export default {
  entry: __dirname + '/src/index.ts',
  output: {
    path: __dirname + '/dist/umd',
    filename: 'angular-resizable-element.js',
    libraryTarget: 'umd',
    library: 'angularResizableElement'
  },
  externals: [
    angularExternals(),
    rxjsExternals()
  ],
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'tslint-loader?emitErrors=true&failOnHint=true',
      exclude: /node_modules/,
      enforce: 'pre'
    }, {
      test: /\.ts$/,
      loader: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)esm5/,
      __dirname + '/src'
    )
  ]
};
