var bignum = require("bignum");

var num = bignum("FFFFFFFE00000001", 16);
console.log(num.toString(16));
console.log((num.add(1)).toString(16));

return;

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
  var key = 'lenqueue6';
  db.lenqueue(key, bignum("FFFFFFFE00000001", 16), function(err, result) {
    if (err) throw err;
    console.log("lenqueue succ");
    db.lget(key, function(err, result) {
      if (err) throw err;
      console.log(result.value);
      db.lremove(key, bignum("FFFFFFFE00000001", 16), function(err, result) {
          if (err) throw err;
          console.log("lremove succ");
          db.lget(key, function(err, result) {
              console.log(err, result.value);
          });
      });
    });
  });

  var key2 = 'ldequeue1';
  db.lenqueue(key2, bignum("FFFFFFFE00000002", 16), function(err, result) {
    if (err) throw err;
    console.log("lenqueue succ");
    db.get(key2, function(err, result) {
      if (err) throw err;
      console.log(result.value);
      db.ldequeue(key2, function(err, result) {
          if (err) throw err;
          console.log("ldequeue succ");
          console.log(result.value.toString(16));
          db.get(key2, function(err, result) {
              console.log(err, result.value);
          });
      });
    });
  });

  var key3 = 'lget1';
  db.lenqueue(key3, bignum("FFFFFFFE00000003", 16), function(err, result) {
    if (err) throw err;
    console.log("lenqueue succ");
    db.lget(key3, function(err, result) {
      if (err) throw err;
      console.log("size: ",result.value.length);
      result.value.forEach(function(element) {
          console.log(element, element.toString(16));
      });
      db.lenqueue(key3, 0x1, function(err, result) {
          if (err) throw err;
          console.log("lenqueue succ");
          db.lget(key3, function(err, result) {
              if (err) throw err;
              console.log("size: ",result.value.length);
              result.value.forEach(function(element) {
                  console.log(element, element.toString(16));
              });
          });
      });
    });
  });
});

