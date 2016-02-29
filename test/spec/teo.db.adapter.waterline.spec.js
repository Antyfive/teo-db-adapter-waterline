/*!
 * teo.db.adapter.waterline.spec
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 2/22/16
 */

/* global define, describe, beforeEach, afterEach, it, assert, sinon */

"use strict";

const WaterlineAdapter = require("../../lib/teo.db.adapter.waterline"),
    Waterline = require("waterline");

describe("Testing teo.db.adapter.waterline", () => {

    let config, adapter, prepareWaterlineAdaptersStub, waterlineAdapters, connections;

    beforeEach(() => {

        waterlineAdapters = {
            // adapters should be installed as packages via npm
            "default": function sailsDisk() {},
            disk: function sailsDisk() {},
            mysql: function sailsMysql() {}
        };

        connections = {
            myLocalDisk: {
                adapter: "disk"
            },
            myLocalMySql: {
                adapter: "mysql",
                host: "localhost",
                database: "foobar"
            }
        };

        config = {
            waterlineAdapters,
            // Connections Config
            // Setup connections using the named adapter configs
            connections
        };

        prepareWaterlineAdaptersStub = sinon.stub(WaterlineAdapter.prototype, "prepareWaterlineAdapters", () => {});

        adapter = new WaterlineAdapter(config);
    });

    afterEach(() => {

        waterlineAdapters = null;
        connections = null;
        prepareWaterlineAdaptersStub.restore();
        config = null;
        adapter = null;

    });

    describe("Initialize", () => {

        beforeEach(() => {

            adapter = new WaterlineAdapter(config);
        });

        afterEach(() => {

            adapter = null;

        });

        it("Should create adapter instance", () => {

            assert.instanceOf(adapter, WaterlineAdapter, "Should be instance of WaterlineAdapter");
            assert.instanceOf(adapter.waterline, Waterline, "Should be instance of Waterline");

        });

        it("Should apply config correct", () => {

            assert.isObject(adapter.config, "The config object should exist");
            assert.equal(adapter.config.waterlineAdapters, waterlineAdapters);
            assert.deepEqual(adapter.config.connections, connections);

        });

        it("Should have identity key for each waterline adapter", () => {

            prepareWaterlineAdaptersStub.restore();

            assert.deepEqual(adapter.config.waterlineAdapters, waterlineAdapters);
            adapter.config.waterlineAdapters.default.identity = "myIdentity";

            adapter.prepareWaterlineAdapters();

            assert.equal(adapter.config.waterlineAdapters.default.identity, "myIdentity", "Should have passed identity");
            assert.equal(adapter.config.waterlineAdapters.disk.identity, 1, "Should set index if no identity property in adapter");
            assert.equal(adapter.config.waterlineAdapters.mysql.identity, 2, "Should set index if no identity property in adapter");

        });

    });

    describe("Models", () => {

        let extendSpy;

        beforeEach(() => {

            adapter = new WaterlineAdapter(config);
            extendSpy = sinon.spy(Waterline.Collection, "extend");

        });

        afterEach(() => {

            adapter = null;
            extendSpy.restore();

        });

        it("Should create models object in the constructor", () => {

            assert.isObject(adapter.models, "Models object should be created");

        });

        it("Should have special models object getter", () => {

            assert.equal(adapter.models, adapter.modelsObject);

        });

        it("Should add model without passing the identity", () => {

            adapter.addModel({
                connection: 'myLocalDisk',

                attributes: {
                    first_name: 'string',
                    last_name: 'string'
                }
            });

            assert.isTrue(extendSpy.calledOnce);
            assert.isFunction(adapter.models.connection, "Should set model key by first attribute in the model object");

        });

        it("Should add model with passing identity key inside model object", () => {

            adapter.addModel({
                identity: 'user',
                connection: 'myLocalDisk',

                attributes: {
                    first_name: 'string',
                    last_name: 'string'
                }
            });

            assert.isTrue(extendSpy.calledOnce);
            assert.isFunction(adapter.models.user, "Should set model key by identity property in the model object");

        });

        it("Should add model by passing identity key as method's first argument", () => {

            adapter.addModel("myIdentity", {
                identity: 'user',
                connection: 'myLocalDisk',

                attributes: {
                    first_name: 'string',
                    last_name: 'string'
                }
            });

            assert.isTrue(extendSpy.calledOnce);
            assert.isFunction(adapter.models.myIdentity, "Should set model key by identity argument in the method");

        });

    });

    describe("Connect", () => {

        let initializeStub, loadCollectionStub, loadModelsSpy;

        beforeEach(() => {

            adapter = new WaterlineAdapter(config);

            initializeStub = sinon.stub(adapter.waterline, "initialize", function(config, callback) {
                callback(null, {collections: "test", connections: "test2"});
            });
            loadCollectionStub = sinon.stub(adapter.waterline, "loadCollection");
            loadModelsSpy = sinon.spy(adapter, "loadModels");

        });

        afterEach(() => {

            adapter = null;
            initializeStub.restore();
            loadCollectionStub.restore();
            loadModelsSpy.restore();

        });

        it("Should load models into waterline", () => {

            adapter.addModel({
                identity: 'user',
                connection: 'myLocalDisk',

                attributes: {
                    first_name: 'string',
                    last_name: 'string'
                }
            });

            adapter.loadModels();

            assert.isTrue(loadCollectionStub.calledOnce);
            assert.equal(loadCollectionStub.args[0][0], adapter.models.user);

        });

        it("Should setup connection", async(function* () {

            assert.isFalse(adapter.connected, "Connected flag should be false");

            yield* adapter.connect();

            assert.isTrue(loadModelsSpy.calledOnce);
            assert.isTrue(initializeStub.calledOnce);

            assert.deepEqual(initializeStub.args[0][0], {
                adapters: adapter.config.waterlineAdapters,
                connections: adapter.config.connections
            });

            assert.isFunction(initializeStub.args[0][1], "Callback should be passed");

            assert.isTrue(adapter.connected, "Connected flag should be true");

            assert.equal(adapter.models, "test", "Models object should be updated from the waterline initialize callback");
            assert.equal(adapter.connections, "test2", "Connection object should be set from the waterline initialize callback");

        }));

    });

    describe("Disconnect", () => {

        let teardownStub;

        beforeEach(() => {

            adapter = new WaterlineAdapter(config);
            teardownStub = sinon.stub(adapter.waterline, "teardown", function(callback) {
               callback();
            });

        });

        afterEach(() => {

            teardownStub.restore();

        });

        it("Should disconnect ORM", async(function* () {

            adapter.connected = true;

            yield* adapter.disconnect();

            assert.isTrue(teardownStub.calledOnce, "teardown.teardown should be called once");
            assert.isFalse(adapter.connected, "Connected flag should be false");

        }));

        it("Shouldn't call disconnect if it's not connected", async(function* () {

            yield* adapter.disconnect();

            assert.isFalse(teardownStub.called, "teardown.teardown shouldn't be called");

        }));

    });

});