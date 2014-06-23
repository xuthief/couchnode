var assert = require('assert');
var bignum = require('bignum');
var H = require('../test_harness.js');

describe('#lenqueue/ldequeue/lremove/lget', function() {

    it('should fail to lremove/ldequeue/lget to not existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("queue_key1_");

        cb.remove(key, function(){
            cb.lget(key, function(err, result) {
                assert.equal(err.code, H.errors.keyNotFound);
                cb.ldequeue(key, function(err, result) {
                    assert.equal(err.code, H.errors.keyNotFound);
                    done();
                });
            });
        });
    });

    it('should succ to lenqueue new key, lget/dequeue existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("queue_key2_");
        var value = bignum("FFFEFDFCF0F1F2F3", 16);
        cb.remove(key, function(){
            cb.lenqueue(key, value, function(err, result) {
                assert.equal(err, undefined, "should not return err: " + err);
                cb.lget(key, function(err, result) {
                    assert.equal(err, undefined, "should not return err: " + err);
                    assert.deepEqual(result.value, [value], "should get same:", result.value, "!=", [value]);
                    cb.ldequeue(key, function(err, result){
                        assert.equal(err, undefined, "should not return err: " + err);
                        assert.deepEqual(result.value, value, "should dequeue same:", result.value, "!=", value);
                        cb.lget(key, function(err, result) {
                            assert.equal(err.code, H.errors.keyNotFound);
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succ to lenqueue old key, lget/dequeue existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("queue_key3_");
        var value = bignum("FFFEFDFCF0F1F2F3", 16);
        cb.lenqueue(key, value, function(err, result) {
            assert.equal(err, undefined, "should not return err: " + err);
            cb.lenqueue(key, value, function(err, result) {
                assert.equal(err, undefined, "should not return err: " + err);
                cb.lget(key, function(err, result) {
                    assert.equal(err, undefined, "should not return err: " + err);
                    assert.deepEqual(result.value, [value, value], "should get same:", result.value, "!=", [value, value]);
                    cb.ldequeue(key, function(err, result){
                        assert.equal(err, undefined, "should not return err: " + err);
                        assert.deepEqual(result.value, value, "should dequeue same:", result.value, "!=", value);
                        cb.ldequeue(key, function(err, result){
                            assert.equal(err, undefined, "should not return err: " + err);
                            assert.deepEqual(result.value, value, "should dequeue same:", result.value, "!=", value);
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

    it('should succ to lenqueue new key, lget/remove existed key', function(done) {
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

    it('should succ to lenqueue old key, lget/remove existed key', function(done) {
        var cb = H.client;
        var key = H.genKey("queue_key5_");
        var value1 = bignum("FFFEFDFCF0F1F2F1", 16);
        var value2 = value1.add(1);
        var value3 = value2.add(1);
        // enqueue value1 -> [value1] 
        cb.lenqueue(key, value1, function(err, result) {
            assert.equal(err, undefined, "should not return err: " + err);
            // enqueue value2  -> [value1, value2] 
            cb.lenqueue(key, value2, function(err, result) {
                assert.equal(err, undefined, "should not return err: " + err);
                // enqueue value1 -> [value1, value2, value1] 
                cb.lenqueue(key, value1, function(err, result) {
                    assert.equal(err, undefined, "should not return err: " + err);
                    // remove value3
                    cb.lremove(key, value3, function(err, result){
                        assert.equal(err, undefined, "should not return err: " + err);
                        cb.lget(key, function(err, result) {
                            assert.equal(err, undefined, "should not return err: " + err);
                            assert.deepEqual(result.value, [value1, value2, value1], "should get same:", 
                                result.value, "!=", [value1, value2, value1]);
                            // remove value1 -> [value2]
                            cb.lremove(key, value1, function(err, result){
                                assert.equal(err, undefined, "should not return err: " + err);
                                cb.lget(key, function(err, result) {
                                    assert.equal(err, undefined, "should not return err: " + err);
                                    assert.deepEqual(result.value, [value2], "should get same:", 
                                        result.value, "!=", [value2]);
                                    // remove value1 -> []
                                    cb.lremove(key, value2, function(err, result){
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
        });
    });

});
