

module.exports = {
  mode: 'development',
  // mode: slsw.lib.webpack.isLocal ? "development": "production",
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  output: {
    library: 'traxjs',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: __dirname,
    globalObject: '(this)'
  }
};

if (process.env.BABEL_ENV === 'test') {
  console.log("BABEL ENV WAS TEST");
  module.exports.output.filename = '[name].[hash:8].js'
}
