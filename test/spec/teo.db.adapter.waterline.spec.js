/*!
 * teo.db.adapter.waterline.spec
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 2/22/16
 */

/* global define, describe, beforeEach, afterEach, it, assert, sinon */

"use strict";

const WaterlineAdapter = require("../../lib/teo.db.adapter.waterline");

describe("Testing teo.db.adapter.waterline", () => {

    let config, adapter;

    beforeEach(() => {

        config = {
            adapters: {
                'sails-disk': sinon.stub()
            },
            models: {
                user: {
                    connection: 'tmp',
                    attributes: {}
                }
            },
            connections: {
                tmp: {
                    adapter: 'sails-disk'
                }
            }
        };

        adapter = new WaterlineAdapter(config);
    });

    afterEach(() => {

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

        });

    });

});