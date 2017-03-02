var projectRoot = process.cwd()
var env = process.env.ENVIRONMENT
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var config = {
  output: { publicPath: (env === 'development' ? '/' : '/dist/') },
  resolve: {
    // Aliases - Used for pointing to reusable parts of your app
    alias: {
      'src': projectRoot + '/src',
      'images': projectRoot + '/src/assets/images'
    }
  },
  performance: { hints: false }
}

if (env === 'production') {
  config.plugins = [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../bundle-analyzer-report.html'
    })
  ]
}

module.exports = config
