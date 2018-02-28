const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ReportalPostcssExtractor = require('reportal-postcss-extractor');

const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 32',
  'Firefox >= 28',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1'
];

module.exports = {
  node: {
    "child_process": "empty",
    "fs": "empty"
  },
  entry: {
    js:"./src/main.js",
    //css:"./src/main.css"
  },
  output: {
    path: "./dist",

    filename: "bundle-v0.5.0.js"
  },
  devtool: "eval-source-map",
  module: {
    loaders: [
      {
        test: /\.js$/,
        //exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test:   /\.css$/,
        //exclude: /node_modules/,
        loader:  ExtractTextPlugin.extract("style","css!postcss")
      }
    ]
  },
  plugins: [

    new ReportalPostcssExtractor(),
    new ExtractTextPlugin('styles-v0.4.0.css')

    /*new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })*/
  ],
  postcss: function (webpack) {
    return [
      require("postcss-import")({
        addDependencyTo: webpack
      }),
      require("postcss-apply")(),
      require("postcss-cssnext")({
        browsers:AUTOPREFIXER_BROWSERS
      })
      //require('postcss-inline-svg')(),
      //require('cssnano')()
    ];
  },
  //watch:true
};
