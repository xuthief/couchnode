var bignum = require("bignum");

/*
   var higher = bops.readUInt32BE(buf, parser._pos);
   parser._pos += 4;
   var lower = bops.readUInt32BE(buf, parser._pos);
   parser._pos += 4;

   var h = bignum(higher).shiftLeft(32);
   return h.or(lower);
*/


/*
var buf = new Buffer(8);
buf.writeUInt32BE(0xFFFFFFFF, 0);
buf.writeUInt32BE(0x00000001, 4);

var higher = buf.readUInt32BE(0);
console.log(higher.toString(16));
var lower = buf.readUInt32BE(4);
console.log(lower.toString(16));

var h = bignum(higher).shiftLeft(32);
var number = h.or(lower);
console.log(number.toString(16));

console.log(number, ": ", number.toString(16), ": ", buf);

var low = number.and(0xFFFFFFFF).toNumber();
buf.writeUInt32BE(low, 4);
console.log(low, ": ", low.toString(16), ": ", buf);

var high = number.shiftRight(32).toNumber();
buf.writeUInt32BE(high, 0);
console.log(high, ": ", high.toString(16), ": ", buf);

return;
*/

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
  var key = 'lenqueue5';
  db.lenqueue(key, 0xFFFFFFFE, function(err, result) {
    if (err) throw err;
    console.log("lenqueue succ");
    db.get(key, function(err, result) {
      if (err) throw err;
      console.log(result.value);
      // {name: Frank}
    });
  });
  db.lenqueue(key, bignum("FFFFFFFE00000001", 16), function(err, result) {
    if (err) throw err;
    console.log("lenqueue succ");
    db.get(key, function(err, result) {
      if (err) throw err;
      console.log(result.value);
      // {name: Frank}
    });
  });
});

