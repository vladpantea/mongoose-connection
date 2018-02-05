'use strict';

const mongooseConn = function(mongoose,settings){
    const options = {
        reconnectTries: settings.MONGOOSE_RETRY || 10, 
        reconnectInterval: settings.MONGOOSE_RECONNECTINTERVAL || 1000,
        poolSize: settings.MONGOOSE_POOLSIZE || 5,
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: settings.MONGOOSE_BUFFERMAXENTRIES || 0,
        keepAlive: settings.MONGOOSE_KEEPALIVE || true,
        connectTimeoutMS : settings.MONGOOSE_CONNECTTIMEOUTMS || 30000
    };

    const buildConnString = function(){
        let toReturn = '';
        if(settings.ENVIRONMENT === 'development'){
            toReturn += 'mongodb://localhost/'+settings.DB;
        }else if(settings.ENVIRONMENT === 'test'){
            toReturn += 'mongodb://localhost/'+settings.DB_TEST;
        }else{
            toReturn += 'mongodb://'+settings.HOST+'/'+settings.DB;
        }

        return toReturn;
    };

    const conn = function(){
        mongoose.connect(buildConnString(),options);

        mongoose.connection.on('connected', function () {  
            console.log('Mongoose default connection open');
        }); 
        
        mongoose.connection.on('error',function (err) {  
            console.log('Mongoose default connection error: ' + err);
        }); 
        
        mongoose.connection.on('disconnected', function () {  
            console.log('Mongoose default connection disconnected'); 
        });

        process.on('SIGINT', function() {  
            mongoose.connection.close(function () { 
              console.log('Mongoose default connection disconnected through app termination'); 
              process.exit(0); 
            }); 
        }); 
    };

    return {
        conn: conn
    };
};

module.exports = mongooseConn;