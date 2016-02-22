/*!
 * teo.db.adapter.waterline
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 2/22/16
 */

"use strict";

const BaseAdapter = require("teo-db-adapter");

module.exports = class WaterlineAdapter extends BaseAdapter {
    constructor(config) {
        super(config);
    }

    applyConfig(config) {
        this.connections = config.connections;
    }

    createModelsObject() {
        this.models = {};
    }


    addModel(key, model) {

    }

    get modelsObject() {
        return this.models;
    }


    * connect() {

    }

    * disconnect() {

    }

    isConnected() {
        return this.connected;
    }
};