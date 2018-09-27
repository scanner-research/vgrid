// https://itnext.io/how-to-package-your-react-component-for-distribution-via-npm-d32d4bf71b4f

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pkg = require('./package.json');

module.exports = {
  context: __dirname,

  entry: {
    index: './src/index'
  },

  // Include source maps for all compiled files
  devtool: 'source-map',

  // Put all output files at assets/bundles
  output: {
    path: path.resolve('./dist'),
    filename: `${pkg.name}.js`,
    library: pkg.name,
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true
  },

  plugins: [
     new ExtractTextPlugin(`${pkg.name}.css`),
  ],

  module: {
    rules: [
      {
        // Compile Sass into CSS, bundle into a single file
        test: /\.*css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'sass-loader'
          ]
        })
      },

      {
        // Put all assets used into a directory?
        test: /\.(png|woff|woff2|eot|ttf|svg|otf|gif|jpg|jpeg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            fallback: 'file-loader',
            name: '[name][md5:hash].[ext]',
            outputPath: 'assets/',
            publicPath: '/assets/'
          }
        }]
      },

      {
        // Compile JSX files to JS
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            plugins: ['transform-decorators-legacy'],
            presets: ['env', 'stage-0', 'react']
          }
        }]
      }
    ]
  },

  // TODO: generic way to resolve aliases?
  resolve: {
    modules: ['node_modules', 'assets', 'css', 'src'],
    extensions: ['.js', '.jsx', '.scss', '.css'],
  },

  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    }
  }
}
