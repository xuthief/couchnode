var bignum = require("bignum");
var s_test = require('../s_test.js');

var db = s_test.testCouchbase(function(err) {
    if (err) throw err;
    var beginValue = s_test.sconfig.clientIndex*s_test.sconfig.keyCount;

    var beginTime = Date.now();

// lget
    var getCount = 0;
    for (var i=0; i<s_test.sconfig.keyCount; i++) {
        var key = s_test.sconfig.keyPrefix + i.toString();
        db.lget(key, function(err, result) {
            if(s_test.sconfig.log) console.log("done:", key);
            if (err && s_test.sconfig.throwOnError) throw err;
            getCount ++;
            if(getCount == s_test.sconfig.keyCount) {
                var endTime = Date.now();
                console.log("all lget done in:", endTime.getTime() - beginTime.getTime(), "ms");
                process.exit(0);
            }
        });
    }
});
