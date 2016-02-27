# teo-db-adapter-waterline
Teo.JS Waterline Adapter

## Usage example
### Config
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

adapterInstance.addModel({
    identity: 'user',
    connection: 'myLocalDisk',

    attributes: {
        first_name: 'string',
        last_name: 'string'
    }
});

yield* adapterInstance.connect();       // connects ORM
yield* adapterInstance.disconnect();    // disconnects ORM
```
## API
#### addModel(identity, modelObject)
Adds model to the registry. The `identity` argument is not necessary.
You can pass `identity` inside model object. Otherwise, identity will be the **first** key of the passed model object. 
