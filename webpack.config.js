"use strict"

const pkg = require('./package.json');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: __dirname,

  entry: "./src/vgrid.tsx",

  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
    libraryTarget: 'umd',
    library: pkg.name,
    umdNamedDefine: true
  },


  plugins: [
     new ExtractTextPlugin(`${pkg.name}.css`),
  ],

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    modules: ['node_modules', 'src', 'assets', 'css'],

    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", '.scss']
  },

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

      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
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
};
