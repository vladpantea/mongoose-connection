'use strict';

const mongooseConn = function(mongoose,Promise){
    const database = process.env.ENVIRONMENT === 'test' ? process.env.STORE_MONGODB_DATABASE_TEST : process.env.STORE_MONGODB_DATABASE;
    
    const getProductionURI = function(){
        if (process.env.STORE_MONGODB_CONNECTION_STRING)
            return process.env.STORE_MONGODB_CONNECTION_STRING;
        
        let connectionString = 'mongodb://';

        if (process.env.STORE_MONGODB_USERNAME && process.env.STORE_MONGODB_PASSWORD) {
          connectionString = connectionString + process.env.STORE_MONGODB_USERNAME + ':' + process.env.STORE_MONGODB_PASSWORD + '@';
        }
        
        connectionString = connectionString + process.env.STORE_MONGODB_HOST + '/' + database + '?authSource=admin';
        
        if (process.env.STORE_MONGODB_REPLICASET) {
            connectionString = connectionString + '&replicaSet=' + process.env.STORE_MONGODB_REPLICASET;
        }
        return connectionString;
    };

    const _promisefy = function(){
        Promise.promisifyAll(mongoose);
        mongoose.Promise = Promise;
    };

    const options = {
        server : {
            "socketOptions" : {
              "keepAlive" : process.env.MONGOOSE_KEEPALIVE || 300000,
              "connectTimeoutMS" : process.env.MONGOOSE_CONNECTTIMEOUTMS || 3000
            }
        },
        replset : {
            "socketOptions" : {
              "keepAlive" : process.env.MONGOOSE_KEEPALIVE || 300000,
              "connectTimeoutMS" : process.env.MONGOOSE_CONNECTTIMEOUTMS || 3000
            }
        },
        reconnectTries: process.env.MONGOOSE_RETRY || 5, 
        reconnectInterval: process.env.MONGOOSE_RECONNECTINTERVAL || 10000,
        poolSize: process.env.MONGOOSE_POOLSIZE || 5,
        dbName: database,
    };

    const connect = function(){
        _promisefy();
        let uri = getProductionURI();

        mongoose.connect(uri,options);
        
        mongoose.connection.on('error', err => {
            console.log({ event: 'Mongoose:error', ...err });
            process.exit(0);
        });

        mongoose.connection.on('connected', () => console.log({ event: 'Mongoose:connected' }));
        mongoose.connection.on('disconnected', () => console.log({ event: 'Mongoose:disconnected' }));
        mongoose.connection.on('reconnected', () => console.log({ event: 'Mongoose:reconnected' }));

        function handleClose(){
            mongoose.connection.close(() => {
                console.log('Mongoose connection closed. Process will exit...');
                process.exit(0);
            });
        }

        process.on('SIGINT', handleClose);
        process.on('SIGTERM', handleClose);
    };  

    return {
        connect: connect
    };
};

module.exports = mongooseConn;
