const execSync = require("child_process").execSync;

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: "inherit",
    env: Object.assign({}, process.env, extraEnv)
  });

console.log("\nBuilding ES modules ...");
exec(
  'babel src -d es --ignore **/*.test.js,**/*.test.tsx --extensions ".ts,.tsx"',
  {
    BABEL_ENV: "es"
  }
);

console.log("Building CommonJS modules ...");
exec(
  'babel src -d . --ignore **/*.test.js,**/*.test.tsx --extensions ".ts,.tsx"',
  {
    BABEL_ENV: "cjs"
  }
);

console.log("\nBuilding UMD ...");
exec("rollup -c -f umd -o umd/yolajs-forms.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "development"
});

console.log("\nBuilding UMD min.js ...");
exec("rollup -c -f umd -o umd/yolajs-forms.min.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "production"
});

console.log("\nBuilding declaration file index.d.ts ...");
exec("tsc", {
  NODE_ENV: "production"
});
