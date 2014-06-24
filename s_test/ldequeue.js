var bignum = require("bignum");
var s_test = require('../s_test.js');

var db = s_test.testCouchbase(function(err) {
    if (err) throw err;

    var beginTime = Date.now();

// ldequeue
    var dequeueCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount; i++) {
        var key = s_test.sconfig.keyPrefix + i.toString();
        db.ldequeue(key, function(err, result) {
            if(s_test.sconfig.log) console.log("done:", key);
            if (err && s_test.sconfig.throwOnError) throw err;
            dequeueCount ++;
            if(dequeueCount == s_test.sconfig.keyCount) {
                var endTime = Date.now();
                console.log("all dequeue done in:", endTime.getTime() - beginTime.getTime(), "ms");
                process.exit(0);
            }
        });
    }
});
