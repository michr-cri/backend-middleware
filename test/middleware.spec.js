var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var config = {
    routes: {resource:'GET /backend/:resource'},
    handlers: {resource:' resourceGetter'},
    urlParameterDateFormat: 'YYYY-MM-DD',
    resourceAttributeUrlParameterMap:{resourceId:'id'},
    dataFiles: {
        path:'./data',
        extension: '.json'
    },
    resourceUrlParamMapFiles: {
        path:'./data/resource-url-param-map',
        extension: '.url.param.map.json'
    }
};

var mockedResourceDatabase = sinon.stub({start:function(){}});
var mockedResourceDatabaseConstructor = sinon.stub().returns(mockedResourceDatabase);
var mockedResourceParameterMapper = {toResourceDaoQueryObject:function(){}};
var MockedResourceParameterMapper = sinon.stub().returns(mockedResourceParameterMapper);

var handler = function(routes, handlers, resourceParameterMapper, dateFormat) {
    assert.equal(config.routes,routes);
    assert.equal(config.handlers,handlers);
    assert.equal(mockedResourceParameterMapper,resourceParameterMapper);
    assert.equal(config.urlParameterDateFormat,dateFormat);
};

var createMiddleWareConstructor = function(mockHandler){
    return proxyquire('../src/middleware', {
        './main.handler':mockHandler,
        './resource.database': mockedResourceDatabaseConstructor,
        './handlers/resource.parameter.mapper': MockedResourceParameterMapper
	});
};

describe('Middleware function should process requests', function() {

    afterEach(function(){
        assert.isTrue(mockedResourceDatabaseConstructor.calledWith(config.dataFiles.path,config.dataFiles.extension));
        assert.isTrue(mockedResourceDatabase.start.called);
        assert.isTrue(MockedResourceParameterMapper.calledWithExactly(config.resourceUrlParamMapFiles.path,config.resourceUrlParamMapFiles.extension));
    });

    it('testMiddleWare(Object config) - No handler matching request url', function() {
        handler.prototype.handle=function(request){
                return undefined;
		};

        var MiddleWare = createMiddleWareConstructor(handler);

        var middleWare = new MiddleWare(config);
        var nextSpy = sinon.spy();

        middleWare({},{},nextSpy);
        assert.isTrue(nextSpy.calledOnce);
    });

    it('testMiddleWare(Object config) - Handler matching request without response headers', function() {
        handler.prototype.handle=function(request){
                return {statusCode: 200, body: {body: 'body'}};
		};

        var MiddleWare = createMiddleWareConstructor(handler);

        var middleWare = new MiddleWare(config);
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.calledWith(200));
        assert.isTrue(res.write.calledWith({body: 'body'}));
    });

    it('testMiddleWare(Object config) - Handler matching request without status code', function() {
        handler.prototype.handle=function(request){
                return {headers: {headerName: 'header'}, body: {body: 'body'}};
        };

        var MiddleWare = createMiddleWareConstructor(handler);

        var middleWare = new MiddleWare(config);
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){},setHeader:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.notCalled);
        assert.isTrue(res.setHeader.calledWith('headerName', 'header'));
        assert.isTrue(res.write.calledWith({body: 'body'}));
    });

    it('testMiddleWare(Object config) - Handler matching request with status code and response headers', function() {
        handler.prototype.handle=function(request){
                return {headers: {headerName: 'header'}, statusCode: 200, body: {body: 'body'}};
        };

        var MiddleWare = createMiddleWareConstructor(handler);

        var middleWare = new MiddleWare(config);
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){},setHeader:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.calledWith(200));
        assert.isTrue(res.setHeader.calledWith('headerName', 'header'));
        assert.isTrue(res.write.calledWith({body: 'body'}));
    });

    it('testMiddleWare(Object config) - Handler matching request without status code, response headers or body', function() {
        handler.prototype.handle=function(request){
                return {};
        };

        var MiddleWare = createMiddleWareConstructor(handler);

        var middleWare = new MiddleWare(config);
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){},setHeader:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.notCalled);
        assert.isTrue(res.setHeader.notCalled);
        assert.isTrue(res.write.calledWith(''));
    });
});