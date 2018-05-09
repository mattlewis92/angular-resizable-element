import * as webpack from 'webpack';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));

export default {
  mode: isDevServer ? 'development' : 'production',
  entry: __dirname + '/demo/entry.ts',
  output: {
    filename: 'demo.js',
    path: isDevServer ? __dirname : __dirname + '/demo'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'tslint-loader?emitErrors=false&failOnHint=false',
        exclude: /node_modules/,
        enforce: 'pre'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: isDevServer
        }
      },
      {
        test: /node_modules\/@angular\/core\/.+\/core\.js$/,
        parser: {
          system: true // disable `System.import() is deprecated and will be removed soon. Use import() instead.` warning
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devServer: {
    port: 8000,
    inline: true,
    hot: true,
    historyApiFallback: true,
    contentBase: 'demo'
  },
  plugins: [
    ...(isDevServer
      ? [
          new webpack.HotModuleReplacementPlugin(),
          new ForkTsCheckerWebpackPlugin({
            watch: ['./src', './demo']
          })
        ]
      : []),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)fesm5/,
      __dirname + '/src'
    )
  ]
};
