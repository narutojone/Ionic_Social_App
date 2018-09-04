// Set the `ENV` global variable to be used in the app.
var path = require('path');
var webpack = require('webpack');

var projectRootDir = process.env.IONIC_ROOT_DIR;
var appScriptsDir = process.env.IONIC_APP_SCRIPTS_DIR;

var config = require(path.join(appScriptsDir, 'config', 'webpack.config.js'));

var env = process.env.IONIC_ENV || 'dev';
var envVars;
try {
  envVars = require(path.join(projectRootDir, 'env', env + '.json'));
} catch (e) {
  envVars = {};
}

config.plugins = config.plugins || [];
config.plugins.push(
  new webpack.DefinePlugin({
    ENV: Object.assign(envVars, {
      environment: JSON.stringify(env)
    })
  })
);

if (env === 'prod') {
  // This helps ensure the builds are consistent if source hasn't changed:
  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
}

module.exports = config;



var fs = require('fs');
var path = require('path');
var pathToConfig = 'config.xml';

if (fs.existsSync(pathToConfig)) {
  var config = fs.readFileSync(pathToConfig, 'utf8');
  var result = "";

  if (env == "dev") {
    result = config.replace(/(<name>).*?(<\/name>)/, '$1PathTime Dev$2');
    result = result.replace(/(<widget id=").*?(" version=)/, '$1fr.pathtime.PathTime.Dev$2');
  } else {
    result = config.replace(/(<name>).*?(<\/name>)/, '$1PathTime$2');
    result = result.replace(/(<widget id=").*?(" version=)/, '$1fr.pathtime.PathTime$2');
  }

  fs.writeFileSync(pathToConfig, result, 'utf8');

  console.log('Update app name');
} else {
  console.log('Could not find Config.xml to update the name');
}


if (env == "dev") {
  if (fs.existsSync("config/GoogleService-Info-Dev.plist")) {
    fs.createReadStream('config/GoogleService-Info-Dev.plist').pipe(fs.createWriteStream('GoogleService-Info.plist'));
  } else {
    console.log("Missing config/GoogleService-Info-Dev.plist file")
  }
} else {
  if (fs.existsSync("config/GoogleService-Info-Release.plist")) {
    fs.createReadStream('config/GoogleService-Info-Release.plist').pipe(fs.createWriteStream('GoogleService-Info.plist'));
  } else {
    console.log("Missing config/GoogleService-Info-Release.plist file")
  }
}
