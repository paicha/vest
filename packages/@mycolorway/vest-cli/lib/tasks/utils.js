const gulpTemplate = require('gulp-template')
const gulpReplace = require('gulp-replace')
const path = require('path')
const fancyLog = require('fancy-log')

function log(message, ...prefixes) {
  fancyLog(prefixes.map(prefix => `[${prefix}] `) + message)
}

function template(config) {
  return gulpTemplate(config, {
    interpolate: /<%=([\s\S]+?)%>/g,
    evaluate: false
  })
}

function resolvePath() {
  return gulpReplace(/(["'`])@\//g, function(match, p1) {
    return p1 + (path.relative(this.file.dirname, this.file.base) || '.') + '/'
  }, {
    skipBinary: false
  })
}

function sassProjectImporter(config) {
  const regex = /^@\//g
  return function(url, prev) {
    return regex.test(url) ? {
      file: url.replace(regex, config.srcPath + '/')
    } : null
  }
}

const dependencyIgnores = [
  '@babel/core',
  '@babel/plugin-transform-modules-commonjs',
  '@babel/preset-env',
  '@mycolorway/weui-wxss',
];

function resolveDependencies(cwd, modulePath = cwd) {
  const packageConfig = require(path.resolve(modulePath, 'package.json'));
  const dependencyNames = packageConfig.dependencies ? Object.keys(packageConfig.dependencies) : [];
  
  return dependencyNames.reduce((dependencies, dependencyName) => {
    if (dependencyIgnores.includes(dependencyName)) return dependencies;
    const modulePath = path.resolve(cwd, 'node_modules', dependencyName);
    return Object.assign(dependencies, {
      [dependencyName]: modulePath,
    }, resolveDependencies(cwd, modulePath));
  }, {});
}

module.exports = {
  log, template, resolvePath, sassProjectImporter, resolveDependencies,
}
