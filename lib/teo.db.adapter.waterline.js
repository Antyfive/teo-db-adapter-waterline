/*!
 * teo.db.adapter.waterline
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 2/22/16
 */

"use strict";

const BaseAdapter = require("teo-db-adapter"),
    Waterline = require("waterline");

module.exports = class WaterlineAdapter extends BaseAdapter {
    constructor(config) {
        super(config);

        this.waterline = new Waterline();
        this.prepareWaterlineAdapters();
    }

    applyConfig(config) {
        this.config = {
            connections: config.connections,
            waterlineAdapters: config.waterlineAdapters
        }
    }

    prepareWaterlineAdapters() {
        Object.keys(this.config.waterlineAdapters).forEach((key, index) => {
            // Make sure our adapter defs have `identity` properties
            if (!this.config.waterlineAdapters[key].identity) {
                this.config.waterlineAdapters[key].identity = index;
            }
        });
    }

    createModelsObject() {  // @base constructor method
        this.models = {};
    }

    /**
     * Adds model
     * @param {*} identity
     * @param {*} model
     * Changeable parameters. Identity can be omitted.
     */
    addModel(identity, model) {
        if (identity instanceof Object) {
            var model = identity,
                // set identity
                identity = model.identity || Object.keys(model)[0]
        }
        // Fold object of collection definitions into an array
        // of extended Waterline models.
        this.models[identity] = Waterline.Collection.extend(model);
    }

    * connect() {
        this.loadModels();

        yield function(callback) {
            // Initialize Waterline
            this.waterline.initialize({
                adapters: this.config.waterlineAdapters,
                connections: this.config.connections
            }, (err, models) => {
                if (err) {
                    throw err
                }

                this.models = models.collections;
                this.connections = models.connections;

                callback();
            });
        }.bind(this);

        this.connected = true;
    }

    * disconnect() {
        if (this.connected === false) {
            console.warn("Waterline isn't connected to disconnect!");
            return;
        }

        yield function(callback) {
            this.waterline.teardown((err) => {
                if (err) {
                    throw err;
                }
                callback();
            });
        }.bind(this);

        this.connected = false;
    }

    isConnected() {
        return this.connected;
    }

    /**
     * Loads collections into orm
     */
    loadModels() {
        Object.keys(this.models).forEach((name) => {
            this.waterline.loadCollection(this.models[name]);
        });
    }

    // getters ---- ---- ---- ---- ---- ----

    get modelsObject() {
        return this.models;
    }
};