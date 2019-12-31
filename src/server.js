import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter as Router } from "react-router-dom";
import path from "path";
import App from "./client/app";
import Routes from "./routes";

const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");

const app = express();
const port = 3000;

const config = require("../webpack.config.js");
const compiler = webpack(config[1]);

const HTML = (req, context) => {
  const body = renderToString(
    <Router location={req.url} context={context}>
      <App />
    </Router>
  );

  return `<html>
    <head>
        <title>React basic SSR</title>
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

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  })
);

app.use(express.static("dist"));

app.get("*", (req, res) => {
  return res.send(HTML({ url: "/404" }, context));
});

Routes.forEach(route => {
  app.get(route.url, (req, res) => {
    return res.send(HTML(req, context));
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
