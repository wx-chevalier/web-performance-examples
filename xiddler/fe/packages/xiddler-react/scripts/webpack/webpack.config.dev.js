const path = require('path');
const merge = require('webpack-merge');

const devConfig = require('../../../../scripts/webpack/webpack.config.dev');

module.exports = merge(devConfig, {
  entry: {
    index: path.resolve(__dirname, '../../example')
  },
  devServer: {
    contentBase: path.resolve(__dirname, '../../public')
  }
});
