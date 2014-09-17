var bignum = require("bignum");
var s_test = require('../s_test.js');

var done = false;

function formatDate() {
    return "[" + new Date() + "] ";
}


var sadd = function(db) {
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount + Math.floor(Math.random() * s_test.sconfig.keyRange);
    var beginTime = Date.now();

    // sadd 
    var enqueueCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * s_test.sconfig.keyRange);
        for (var j=0; j<s_test.sconfig.opsPerKey; j++) {
            if(s_test.sconfig.log) console.log("do:", key, i, j);
            db.sadd(key, beginValue + j, function(err, result) {
                if(s_test.sconfig.log) console.log("done:", key);
                if (err && s_test.sconfig.throwOnError) throw err;
                if (err) console.log(err);
                enqueueCount ++;
                if(enqueueCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                    var endTime = Date.now();
                    console.log(formatDate() + enqueueCount + " sadd ops done in " + (endTime - beginTime) + " ms");
                    done = true;
                }
            });
        }
    }
};


var sismember = function(db) {
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount + Math.floor(Math.random() * s_test.sconfig.keyRange);
    var beginTime = Date.now();
    // sismember 
    var sismemberCount = 0;

    // sismember 
    for (var i=0; i<s_test.sconfig.keyCount*s_test.sconfig.opsPerKey; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * s_test.sconfig.keyRange);
        db.sismember(key, beginValue, function(err, result) {
            if(s_test.sconfig.log) console.log("done:", key);
            if (err && s_test.sconfig.throwOnError) throw err;
            if (err && err.code != 13) console.log(err);
            sismemberCount ++;
            if (sismemberCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                var endTime = Date.now();
                console.log(formatDate() + s_test.sconfig.keyCount*s_test.sconfig.opsPerKey + " sismember ops done in " + (endTime - beginTime) + " ms");
                done = true;
            }
        });
    }
};

var sremove = function(db) {
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount + Math.floor(Math.random() * s_test.sconfig.keyRange);

    var beginTime = Date.now();

    // sremove
    var removeCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * s_test.sconfig.keyRange);
        for (var j=0; j<s_test.sconfig.opsPerKey; j++) {
            db.sremove(key, beginValue + j, function(err, result) {
                if(s_test.sconfig.log) console.log("done:", key);
                if (err && s_test.sconfig.throwOnError) throw err;
                if (err && err.code != 13) console.log(err);
                removeCount ++;
                if(removeCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                    var endTime = Date.now();
                    console.log(formatDate() + removeCount + " sremove ops done in " + (endTime - beginTime) + " ms");
                    done = true;
                }
            });
        }
    }
};

var sget = function(db) {
    var beginTime = Date.now();

    // sget
    var getCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount*s_test.sconfig.opsPerKey; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * s_test.sconfig.keyRange);
        db.sget(key, function(err, result) {
            if(s_test.sconfig.log) console.log("done:", key);
            if (err && s_test.sconfig.throwOnError) throw err;
            if (err && err.code != 13) console.log(err);
            getCount ++;
            if(getCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                var endTime = Date.now();
                console.log(formatDate() + getCount + " sget ops done in " + (endTime - beginTime) + " ms");
                done = true;
            }
        });
    }
};

var testFunc = [sadd, sremove, sismember, sget];
var loop = function() {
    setTimeout(function(){
        if (!s_test.sconfig.waitDone || done) {
            done = false;
            //testFunc[0](db);
            testFunc[Math.floor(Math.random()*testFunc.length)](db);
        }
        loop();
    },500);
};

var db = s_test.testCouchbase(function(err) {
    if (err) throw err;
    done = true;
    loop();
});
