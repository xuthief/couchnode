var couchbase = require('../lib/couchbase.js');
var db = new couchbase.Connection({host:"192.168.2.155:8091", bucket: "default"}, function(err) {
  if (err) throw err;
  db.set('testdoc', {name:'Frank'}, function(err, result) {
    if (err) throw err;
    console.log("store succ");
    db.get('testdoc', function(err, result) {
      if (err) throw err;
      console.log(result.value);
      // {name: Frank}
    });
  });
  db.lenqueue('lenqueue', 999, function(err, result) {
    if (err) throw err;
    console.log("lenqueue succ");
    db.get('lenqueue', function(err, result) {
      if (err) throw err;
      console.log(result.value);
      // {name: Frank}
    });
  });
});

