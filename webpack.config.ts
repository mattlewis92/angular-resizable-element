import * as webpack from 'webpack';
const IS_PROD = process.argv.indexOf('-p') > -1;

export default {
  devtool: IS_PROD ? 'source-map' : 'eval',
  entry: __dirname + '/demo/entry.ts',
  output: {
    filename: 'demo.js',
    path: IS_PROD ? __dirname + '/demo' : __dirname
  },
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'tslint-loader?emitErrors=false&failOnHint=false',
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
  devServer: {
    port: 8000,
    inline: true,
    hot: true,
    historyApiFallback: true,
    contentBase: 'demo'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      ENV: JSON.stringify(IS_PROD ? 'production' : 'development')
    }),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      __dirname + '/src'
    )
  ]
};
