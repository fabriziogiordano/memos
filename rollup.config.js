import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./src/frontend/assets/js/firebase.js",
  output: {
    file: "./public/assets/js/bundle.js",
    sourcemap: "inline",
    format: "iife",
  },
  plugins: [nodeResolve()],
};
