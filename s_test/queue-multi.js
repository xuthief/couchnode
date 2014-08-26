var bignum = require("bignum");
var s_test = require('../s_test.js');

var testFunc = [];
var done = false;

function formatDate() {
    return "[" + new Date() + "] ";
}

testFunc.push(function(db) {
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount;

    var beginTime = Date.now();

    // lenqueue
    var enqueueCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * 10000);
        for (var j=0; j<s_test.sconfig.opsPerKey; j++) {
            if(s_test.sconfig.log) console.log("do:", key, i, j);
            db.lenqueue(key, beginValue + j, function(err, result) {
                if(s_test.sconfig.log) console.log("done:", key);
                if (err && s_test.sconfig.throwOnError) throw err;
                enqueueCount ++;
                if(enqueueCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                    var endTime = Date.now();
                    console.log(formatDate() + enqueueCount + " lenqueue ops done in " + (endTime - beginTime) + " ms");
                    done = true;
                }
            });
        }
    }
});

testFunc.push(function(db) {
    var beginTime = Date.now();

    // ldequeue
    var dequeueCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount*s_test.sconfig.opsPerKey; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * 10000);
        db.ldequeue(key, function(err, result) {
            if(s_test.sconfig.log) console.log("done:", key);
            if (err && s_test.sconfig.throwOnError) throw err;
            dequeueCount ++;
            if(dequeueCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                var endTime = Date.now();
                console.log(formatDate() + dequeueCount + " ldequeue ops done in " + (endTime - beginTime) + " ms");
                done = true;
            }
        });
    }
});

testFunc.push(function(db) {
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount;

    var beginTime = Date.now();

    // lremove
    var removeCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * 10000);
        for (var j=0; j<s_test.sconfig.opsPerKey; j++) {
            db.lremove(key, beginValue + j, function(err, result) {
                if(s_test.sconfig.log) console.log("done:", key);
                if (err && s_test.sconfig.throwOnError) throw err;
                removeCount ++;
                if(removeCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                    var endTime = Date.now();
                    console.log(formatDate() + removeCount + " lremove ops done in " + (endTime - beginTime) + " ms");
                    done = true;
                }
            });
        }
    }
});

testFunc.push(function(db) {
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount;
    var beginTime = Date.now();

    // lget
    var getCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount*s_test.sconfig.opsPerKey; i++) {
        var key = s_test.sconfig.keyPrefix + Math.floor(Math.random() * 10000);
        db.lget(key, function(err, result) {
            if(s_test.sconfig.log) console.log("done:", key);
            if (err && s_test.sconfig.throwOnError) throw err;
            getCount ++;
            if(getCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                var endTime = Date.now();
                console.log(formatDate() + getCount + " lget ops done in " + (endTime - beginTime) + " ms");
                done = true;
            }
        });
    }
});

var loop = function() {
    setTimeout(function(){
        if (done) {
            done = false;
            testFunc[Math.floor(Math.random()*testFunc.length)](db);
        }
        loop();
    },1500);
};

var db = s_test.testCouchbase(function(err) {
    if (err) throw err;
    done = true;
    loop();
});
