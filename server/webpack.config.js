const path = require("path");
const nodeExternals = require("webpack-node-externals");
const WebpackShellPlugin = require("webpack-shell-plugin");

const { NODE_ENV = "production" } = process.env;

module.exports = {
  entry: "./server/server.ts",
  mode: NODE_ENV,
  target: "node",
  stats: "errors-only",
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "../build"),
  },
  resolve: {
    extensions: [".js"],
  },
  optimization: {
    minimize: false,
    splitChunks: false,
  },
  watch: NODE_ENV === "development",
  node: {
    __dirname: false,
  },
  plugins: [
    NODE_ENV === "development" &&
      new WebpackShellPlugin({
        onBuildEnd: ["npm run watch:server"],
      }),
  ].filter(Boolean),
  externals: [nodeExternals()],
};
