/*jshint esversion: 6 */
const args = process.argv.slice(2);
const baseDir = args[0];
const openBrowser = (args[1]==='true');

var bodyParser = require('body-parser');

//Offline Database BackendMiddleware to mock responses to backend requests.
const backendMiddleware = require('../../src/middleware.js');
const routeRegistrar = require('../middleware-config/handlers');
const config ={
    routes: routeRegistrar.routes,
    handlers: routeRegistrar.handlers,
    urlParameterDateFormat: 'YYYY-MM-DD',
    dataFiles: {
        path: './example/middleware-config/data',
        extension: '.json'
    },
    resourceUrlParamMapFiles: {
        path: './example/middleware-config/mapping',
        extension: '.map.json'
    },
    computedProperties: require('../middleware-config/computed.properties'),
    responseTransformerCallback:require('../middleware-config/response.transformer.js'),
    contextPath: '/'
};

var bs = require('browser-sync').create();

// init starts the server
bs.init(
    {
        notify: false,
        server: baseDir,
        middleware: [bodyParser.json(),bodyParser.urlencoded({extended:true}),backendMiddleware.create(config)],
        https: {
            key : "example/server/certs/server.key",
            cert: "example/server/certs/server.crt"
        },
        open: Boolean(openBrowser)
    }
);

bs.watch('./example/**',  {ignored: './example/server/**'} , function (event, file) {
    if (event === 'change') {
        console.log('File changed, reloading: '+file);
        var exec = require('child_process').exec;
        bs.reload(file);
    }
});
