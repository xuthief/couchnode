var bignum = require("bignum");
var s_test = require('../s_test.js');

var db = s_test.testCouchbase(function(err) {
    if (err) throw err;
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount;

    var beginTime = Date.now();

// lenqueue
    var enqueueCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount; i++) {
        var key = s_test.sconfig.keyPrefix + i.toString();
        for (var j=0; j<s_test.sconfig.opsPerKey; j++) {
            if(s_test.sconfig.log) console.log("do:", key, i, j);
            db.lenqueue(key, beginValue + j, function(err, result) {
                if(s_test.sconfig.log) console.log("done:", key);
                if (err && s_test.sconfig.throwOnError) throw err;
                enqueueCount ++;
                if(enqueueCount == s_test.sconfig.keyCount*s_test.sconfig.opsPerKey) {
                    var endTime = Date.now();
		    console.log("all enqueue done in:", endTime - beginTime, "ms");
                    process.exit(0);
                }
            });
        }
    }
});
