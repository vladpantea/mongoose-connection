# mongoose-connection
Module responsible with mongodb connection. Options took from env settings

## Installation

`$ npm install mongoose-connectx`

## Usage

- Load the module
- Pass configuration options(mongoose,bluebird)


### Example

```js
/* index.js */
    //init express

    //Mongodb Connect
    const mongooseConnection = require('mongoose-connectx')(mongoose,bluebird);
    mongooseConnection.connect();
    //endregion

    //init routes

    //init express server
```

# License

[MIT](LICENSE)



