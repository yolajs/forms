import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import sourceMaps from "rollup-plugin-sourcemaps";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";

const config = {
  input: "src/index.ts",
  output: {
    name: "YForms",
    globals: {
      react: "React",
      "react-dom": "ReactDOM",
      immer: "immer"
    }
  },
  external: ["react", "react-dom", "immer"],
  plugins: [
    babel({
      exclude: "node_modules/**",
      extensions: [".js", ".ts", ".tsx"]
    }),
    resolve(),
    commonjs({
      include: /node_modules/
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ]
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(
    uglify({
      compress: {
        conditionals: false,
        sequences: false,
        loops: false,
        join_vars: false,
        collapse_vars: false,
        pure_funcs: ["Object.defineProperty"]
      }
    }),
    uglify({
      compress: {
        collapse_vars: true,
        evaluate: true,
        unsafe: true,
        loops: false,
        keep_fargs: false,
        pure_getters: true,
        unused: true,
        dead_code: true
      }
    }),
    sourceMaps(),
    sizeSnapshot()
  );
}

export default config;
