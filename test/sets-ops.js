var assert = require('assert');
var bignum = require('bignum');
var H = require('../test_harness.js');

describe('#sadd/sismember/sremove/sget', function() {

    it('should fail to sadd/sismember/sremove/sget to not existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("sets_key1_");

        cb.remove(key, function(){
            cb.sget(key, function(err, result) {
                assert.equal(err.code, H.errors.keyNotFound);
                cb.sismember(key, 1, function(err, result) {
                    assert.equal(err.code, H.errors.keyNotFound);
                    done();
                });
            });
        });
    });

    it('should succ to sadd new key, sget/sismember existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("sets_key2_");
        var value = bignum("FFFEFDFCF0F1F2F3", 16);
        cb.remove(key, function(){
            cb.sadd(key, value, function(err, result) {
                assert.equal(err, undefined, "should not return err: " + err);
                cb.sget(key, function(err, result) {
                    assert.equal(err, undefined, "should not return err: " + err);
                    assert.deepEqual(result.value, [value], "should get same:", result.value, "!=", [value]);
                    cb.sismember(key, value, function(err, result){
                        assert.equal(err, undefined, "should not return err: " + err);
                        cb.sremove(key, value, function(err, result){
                            assert.equal(err, undefined, "should not return err: " + err);
                            cb.sget(key, function(err, result) {
                                assert.equal(err.code, H.errors.keyNotFound);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

//  it('should succ to sadd old key, sget/sremove existed key', function(done) {
//      var cb = H.client;
//      var key = H.genKey("sets_key3_");
//      var value = bignum("FFFEFDFCF0F1F2F3", 16);
//      var value1 = value.add(1);
//      cb.sadd(key, value, function(err, result) {
//          assert.equal(err, undefined, "should not return err: " + err);
//          cb.sadd(key, value, function(err, result) {
//              assert.equal(err, undefined, "should not return err: " + err);
//              cb.sget(key, function(err, result) {
//                  assert.equal(err, undefined, "should not return err: " + err);
//                  assert.deepEqual(result.value, [value, value1], "should get same:", result.value, "!=", [value, value1]);
//                  cb.sremove(key, value, function(err, result){
//                      assert.equal(err, undefined, "should not return err: " + err);
//                      cb.sremove(key, value1, function(err, result){
//                          assert.equal(err, undefined, "should not return err: " + err);
//                          cb.lget(key, function(err, result) {
//                              assert.equal(err.code, H.errors.keyNotFound);
//                              done();
//                          });
//                      });
//                  });
//              });
//          });
//      });
//  });

    it('should succ to sadd new key, sget/sremove existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("queue_key4_");
        var value = bignum("FFFEFDFCF0F1F2F3", 16);
        cb.remove(key, function(){
            cb.lenqueue(key, value, function(err, result) {
                assert.equal(err, undefined, "should not return err: " + err);
                cb.lget(key, function(err, result) {
                    assert.equal(err, undefined, "should not return err: " + err);
                    assert.deepEqual(result.value, [value], "should get same:", result.value, "!=", [value]);
                    var evalue = value.add(1);
                    cb.lremove(key, evalue, function(err, result){
                        assert.equal(err, undefined, "should not return err: " + err);
                        cb.lget(key, function(err, result) {
                            assert.equal(err, undefined, "should not return err: " + err);
                            assert.deepEqual(result.value, [value], "should get same:", result.value, "!=", [value]);
                            cb.lremove(key, value, function(err, result){
                                assert.equal(err, undefined, "should not return err: " + err);
                                cb.lget(key, function(err, result) {
                                    assert.equal(err.code, H.errors.keyNotFound);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should succ to sadd old key, sget/sremove existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("sets_key5_");
        var value1 = bignum("FFFEFDFCF0F1F2F1", 16);
        var value2 = value1.add(1);
        var value3 = value2.add(1);
        // sadd value1 -> [value1] 
        cb.sadd(key, value2, function(err, result) {
            assert.equal(err, undefined, "should not return err: " + err);
            // sadd value2  -> [value1, value2] 
            cb.sadd(key, value1, function(err, result) {
                assert.equal(err, undefined, "should not return err: " + err);
                // sadd value1 -> [value1, value2, value1] 
                cb.sadd(key, value3, function(err, result) {
                    assert.equal(err, undefined, "should not return err: " + err);
                    // remove value3
                    cb.sremove(key, value3, function(err, result){
                        assert.equal(err, undefined, "should not return err: " + err);
                        cb.sget(key, function(err, result) {
                            assert.equal(err, undefined, "should not return err: " + err);
                            assert.deepEqual(result.value, [value1, value2], "should get same:" + 
                                result.value + "!=" + [value1, value2]);
                            // remove value1 -> [value2]
                            cb.sremove(key, value1, function(err, result){
                                assert.equal(err, undefined, "should not return err: " + err);
                                cb.sget(key, function(err, result) {
                                    assert.equal(err, undefined, "should not return err: " + err);
                                    assert.deepEqual(result.value, [value2], "should get same:", 
                                        result.value, "!=", [value2]);
                                    // remove value1 -> []
                                    cb.sremove(key, value2, function(err, result){
                                        assert.equal(err, undefined, "should not return err: " + err);
                                        cb.sget(key, function(err, result) {
                                            assert.equal(err.code, H.errors.keyNotFound);
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

});
