var assert = require('assert');
var H = require('../test_harness.js');

describe('#lenqueue/ldequeue/lremove/lget', function() {

    it('should succ to lenqueue to new key', function(done) {
        var cb = H.client;
        var key = H.genKey("lenqueue");

        cb.remove(key, function(){});

        cb.lenqueue(key, 'should work', function(err, result){
            assert.equal(err.code, H.errors.success);
            done();
        });
    });

  it('should fail to prepend to missing key', function(done) {
    var cb = H.client;
    var key = H.genKey("append");

    cb.remove(key, function(){});

    cb.append(key, 'willnotwork', function(err, result){
      assert.equal(err.code, H.errors.notStored);
      done();
    });
  });

  it('should fail to append to missing key', function(done) {
    var cb = H.client;
    var key = H.genKey("prepend");
    cb.remove(key, function(){});
    cb.prepend(key, 'willnotwork', function(err, result){
      assert.equal(err.code, H.errors.notStored);
      done();
    });
  });

});
