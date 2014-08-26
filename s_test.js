"use strict";

var couchbase = require('./lib/couchbase.js'),
  fs = require('fs'),
  util = require('util');
var assert = require('assert');

var configReady = false;
var supportsN1ql = false;

var config;
var configFilename = 'config.json';

if (fs.existsSync(configFilename)) {
  config = JSON.parse(fs.readFileSync(configFilename));
} else {
  config = {
    mock : false,
    host : '192.168.2.155:8091',
    queryhosts : '',
    bucket : 'default',
    operationTimeout : 20000,
    connectionTimeout : 20000,
  };
}

var sconfig;
var sconfigFilename = 'sconfig.json';

if (fs.existsSync(sconfigFilename)) {
  sconfig = JSON.parse(fs.readFileSync(sconfigFilename));
} else {
  sconfig = {
    clientIndex : 1,
    keyPrefix : 'nj_key_',
    keyCount : 100000,
    opsPerKey : 500,
    throwOnError : false
  };
}


if (process.env.CNMOCK !== undefined) {
  config.mock = process.env.CNMOCK ? true : false;
}
if (process.env.CNHOST !== undefined) {
  config.host = process.env.CNHOST;
}
if (process.env.CNQHOSTS !== undefined) {
  config.queryhosts = process.env.CNQHOSTS;
}
if (process.env.CNBUCKET !== undefined) {
  config.bucket = process.env.CNBUCKET;
}

if (config.mock) {
  couchbase = couchbase.Mock;
}
var isMock = config.mock;
delete config.mock;

// Use direct setup for the moment.
supportsN1ql = config.queryhosts !== '';
configReady = true;

exports.sconfig = sconfig;

exports.testCouchbase = function(oconfig, callback) {
  if (oconfig instanceof Function) {
    callback = oconfig;
    oconfig = undefined;
  }
  if (!oconfig) {
    oconfig = {};
  }

  if (!configReady) {
    throw new Error('newClient before config was ready');
  }

  var this_config = {};
  for (var i in config) {
    if (config.hasOwnProperty(i)) {
      this_config[i] = config[i];
    }
  }
  for (var j in oconfig) {
    if (oconfig.hasOwnProperty(j)) {
      this_config[j] = oconfig[j];
    }
  }

  return new couchbase.Connection(this_config, callback);
};

