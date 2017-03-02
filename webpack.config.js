var projectRoot = process.cwd()
var env = process.env.ENVIRONMENT

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

module.exports = config
