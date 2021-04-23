
const MainBuild =  {
  // mode: slsw.lib.webpack.isLocal ? "development": "production",
  optimization: {
    // We no not want to minimize our code.
    // minimize: false
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

const Es6Build =  {
  // mode: slsw.lib.webpack.isLocal ? "development": "production",
  optimization: {
    // We no not want to minimize our code.
    // minimize: false
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
    libraryTarget: 'amd',
    filename: 'traxjs.js',
    path: __dirname + '/dist',
    // globalObject: '(this)'
  }
};

const Builds = [MainBuild, Es6Build]

module.exports = [...Builds];

if (process.env.BABEL_ENV === 'test') {
  console.log("BABEL ENV WAS TEST");
  module.exports.output.filename = '[name].[hash:8].js'
}
