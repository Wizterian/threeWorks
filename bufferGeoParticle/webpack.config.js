const path = require('path'); // pathをOSによってバグが出るのを防ぐ
const glob = require('glob'); // globを使うとファイルの一覧を取得

// プラグインはrequire()
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {VueLoaderPlugin} = require("vue-loader"); // vueのpug用
const webpack = require('webpack'); // vueのpug用 warning回避

console.log('*********************************');
console.log('file list for js ...');
console.log('*********************************');
const jsEntries = {};
glob.sync('./src/**/Entry.js', {
  ignore: './src/**/_*.js'
}).map((file) => {
  console.log(file);
  const regEx = new RegExp('./src');
  const fileOriginalName = file.replace(regEx, '');
  const key = fileOriginalName.replace('Entry.js', 'main.js');
  jsEntries[key] = file;
});

console.log('*********************************');
console.log('file list for scss ...');
console.log('*********************************');
const sassEntries = {};
glob.sync('./src/**/*.scss', {
  ignore: './src/**/_*.scss'
}).map((file) => {
  console.log(file);
  const regEx = new RegExp('./src');
  const fileOriginalName = file.replace(regEx, '');
  const fileChangeDirName = fileOriginalName.replace('/sass/', '/css/');
  const fileChangeExtName = fileChangeDirName.replace('.scss', '.css');
  sassEntries[fileChangeExtName] = file;
});

const MODE = 'development';

module.exports = [
  {
    mode: MODE,
    entry: sassEntries,
    output: {
      path: path.join(`${__dirname}/htdocs`),
      filename: '../webpack/hash/[contenthash]'
    },
    module: {
      rules: [
        {
          test: /\.(scss|sass|css)$/,
          use: [
            // cssをjsに取り込まず外部出力する
            MiniCssExtractPlugin.loader,
            {
              // CSSをバンドルするための機能
              loader: 'css-loader',
              options: {
                // css内の url()は無視してwebpackで取り込まない
                url: false
              }
            },
            // {
            //   // 変換
            //   loader: 'postcss-loader',
            //   options: {
            //     plugins: [
            //       require('cssnano')({
            //         preset: 'default',
            //       }),
            //       require('autoprefixer')({
            //         grid: true // CSS Grid Layout
            //       }),
            //       require('postcss-assets')({
            //         loadPaths: ['htdocs']
            //       })
            //     ]
            //   }
            // },
            {
              // sassをcssに変換
              loader: 'sass-loader',
              options: {
                // ソースマップの利用有無
                sourceMap: false,
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name]'
      }),
    ]
  },

  // JS
  {
    mode: MODE,
    entry: jsEntries,
    output: {
      path: path.resolve(__dirname, 'htdocs'), // 出力ディレクトリ名
      filename: '[name]' // 出力ファイル名
    },
    resolve: {
      extensions: ['.js', 'vue'], // vueのpug用
      alias: {'@': path.resolve(__dirname, 'htdocs')} // vueのpug用（optional）
    },
    //ローダーの設定
    module: {
      rules: [
        {
          test: /\.pug$/, // vueのpug用 <template lang="pug">の場合
          loader: 'vue-pug-loader'
        },
        {
          test: /.css$/, // vueのpug用 <style>の場合
          use: [ // vue-style-loader、css-loaderを使う
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.scss$/, // vueのpug用 <style lang="scss">の場合
          use: [ // vue-style-loader、css-loaderを使う
            'vue-style-loader',
            'css-loader',
            'sass-loader' // scssを使いたい場合
          ]
        },
        {
          test:/\.vue$/, // // vueのpug用 拡張子が.vueの場合
          loader: 'vue-loader' // vue-loaderを使う
        },
        {
          test: /\.js$/, // vueのpug用 babelがないとエラー 設定必須
          exclude: /node_modules/, // ローダーの処理から外すフォルダ
          loader: 'babel-loader', // babel-loaderを使う
          options: {
            // プリセットを指定することで、ES2019をES6に変換
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(), // vueのpug用
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: false, // vueのpug用 warningが出るため記載
        __VUE_PROD_DEVTOOLS__: false, // vueのpug用 warningが出るため記載
      })
    ],
    // watch: true, // serveしていれば不要
    cache: true,
    // ローカルサーバー
    devServer: {
      static: {
        directory: path.resolve(__dirname, "htdocs")
      },
      port: 3006,
      open: true
    }
  },
];