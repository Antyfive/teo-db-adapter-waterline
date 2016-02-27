# teo-db-adapter-waterline
Teo.JS Waterline Adapter

## Usage example

```javascript
const WaterlineAdapter = require("teo-db-adapter-waterline");

let adapterInstance = new WaterlineAdapter({
    waterlineAdapters: {
      // adapters should be installed as packages via npm
      "default": require('sails-disk'),
      disk: require('sails-disk'),
      mysql: require('sails-mysql')
    },
    connections: {
        myLocalDisk: {
            adapter: "disk"
        },
        myLocalMySql: {
            adapter: "mysql",
            host: "localhost",
            database: "foobar"
        }
    };
});
```
