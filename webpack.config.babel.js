import path from 'path';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
import { renderToString } from 'react-dom/server';
import { StaticRouter as Router } from 'react-router-dom';
import App from './src/client/app';
import Routes from './src/routes';
import React from 'react';

module.exports = [
  {
    target: process.env.NODE_ENV == 'production' ? 'node' : 'web',
    entry: {
      client: './src/client/index.js',
      server: './src/server.js'
    },
    devServer: {
      after: (app, server, compiler) => {
        const HTML = (req, context) => {
          const body = renderToString(
            <Router location={req.url} context={context}>
              <App />
            </Router>
          );

          return `<html>
            <head>
                <title>React basic SSR | OVPV</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0;">
                <div id="app">
                ${body}
                </div>
                <script src="client.js"></script>
            </body>
            </html>`;
        };

        const context = {};

        app.get('*', (req, res) => {
          return res.send(HTML({ url: '/404' }, context));
        });

        Routes.forEach(route => {
          app.get(route.url, (req, res) => {
            return res.send(HTML(req, context));
          });
        });
      },
      contentBase: path.join(__dirname, 'dist'),
      open: true,
      hot: true,
      compress: true,
      port: 9000
    },
    node: {
      dns: 'mock',
      fs: 'empty',
      path: true,
      url: false,
      net: 'empty'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    }
    // plugins: [
    //   new HtmlWebpackPlugin({
    //     template: './src/index.html',
    //     filename: './dist/index.html',
    //     excludeChunks: ['server']
    //   })
    // ]
  }
];
