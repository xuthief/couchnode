/* -*- Mode: C++; tab-width: 4; c-basic-offset: 4; indent-tabs-mode: nil -*- */
/*
 *     Copyright 2010-2013 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
#ifndef TESTS_MOCK_ENVIRONMENT_H
#define TESTS_MOCK_ENVIRONMENT_H 1

#include "config.h"
#include <gtest/gtest.h>
#include <libcouchbase/couchbase.h>
#include "libvbucket/cJSON.h"
#include "serverparams.h"


class HandleWrap
{

    friend class MockEnvironment;

public:
    lcb_t getLcb() const {
        return instance;
    }

    lcb_io_opt_t getIo() const {
        return iops;
    }

    void destroy();

    // Don't ever allow copying. C++0x allows = 0, though
    HandleWrap operator= (const HandleWrap &) {
        fprintf(stderr, "Can't copy this object around!\n");
        abort();
        return HandleWrap();
    }

    HandleWrap() : instance(NULL), iops(NULL) { }
    virtual ~HandleWrap();


private:
    lcb_t instance;
    lcb_io_opt_t iops;
};


class MockCommand
{
#define XMOCKCMD(X) \
    X(FAILOVER) \
    X(RESPAWN) \
    X(HICCUP) \
    X(TRUNCATE) \
    X(MOCKINFO) \
    X(PERSIST) \
    X(CACHE) \
    X(UNPERSIST) \
    X(UNCACHE) \
    X(ENDURE) \
    X(PURGE) \
    X(KEYINFO) \
    X(GET_MCPORTS) \
    X(SET_CCCP)

public:
    enum Code {
#define X(cc) cc,
        XMOCKCMD(X)
#undef X
        _NONE
    };

    static std::string GetName(Code code) {

#define X(cc) if (code == cc) { return #cc; }
        XMOCKCMD(X)
#undef X

        abort();
        return "";
    }

    MockCommand(Code code);

    // Various methods to set a field in the payload
    void set(const std::string &, const std::string &);
    void set(const std::string &, int);
    void set(const std::string, bool);
    void set(const std::string&, cJSON *);
    virtual ~MockCommand();

    // Encodes the command in a form suitable for sending over the network
    std::string encode();

protected:
    Code code;
    std::string name;
    cJSON *command;
    cJSON *payload;
    virtual void finalizePayload() {}

private:
    MockCommand(const MockCommand &other);
};

class MockKeyCommand : public MockCommand
{
public:
    MockKeyCommand(Code code, std::string &key)
        : MockCommand(code), vbucket(-1) {
        this->key = key;
    }

    const std::string &getKey() const {
        return key;
    }

    short vbucket;
    std::string bucket;
    std::string key;

protected:
    virtual void finalizePayload();
};

class MockMutationCommand : public MockKeyCommand
{
public:
    MockMutationCommand(Code code, std::string &key)
        : MockKeyCommand(code, key), onMaster(false), replicaCount(0), cas(0) {}

    bool onMaster;
    int replicaCount;
    std::vector<int> replicaList;
    lcb_uint64_t cas;
    std::string value;

protected:
    virtual void finalizePayload();
};

class MockBucketCommand : public MockCommand
{
public:
    MockBucketCommand(Code code, int index, std::string bucketstr = "default")
        : MockCommand(code) {
        ix = index;
        bucket = bucketstr;
    }

protected:
    virtual void finalizePayload();
    int ix;
    std::string bucket;
};

class MockResponse
{
public:
    MockResponse() : jresp(NULL) {}
    ~MockResponse();
    void assign(const std::string& s);

    bool isOk();

    const cJSON *getRawResponse() {
        return jresp;
    }

protected:
    cJSON *jresp;
    friend std::ostream& operator<<(std::ostream&, const MockResponse&);
private:
    MockResponse(const MockResponse&);
};

class MockEnvironment : public ::testing::Environment
{
public:
    enum ServerVersion {
        VERSION_UNKNOWN = 0,
        VERSION_10 = 1,
        VERSION_20 = 2
    };

    virtual void SetUp();
    virtual void TearDown();

    static MockEnvironment *getInstance(void);
    static void Reset();

    /**
     * Make a connect structure you may utilize to connect to
     * the backend we're running the tests towards.
     *
     * @param crst the create structure to fill in
     * @param io the io ops to use (pass NULL if you don't have a
     *           special io ops you want to use
     */
    void makeConnectParams(lcb_create_st &crst, lcb_io_opt_t io) {
        serverParams.makeConnectParams(crst, io);
    }

    /**
     * Get the number of nodes used in the backend
     */
    int getNumNodes(void) const {
        return numNodes;
    }

    /**
     * Are we currently using a real cluster as the backend, or
     * are we using the mock server.
     *
     * You should try your very best to avoid using this variable, and
     * rather extend the mock server to support the requested feature.
     */
    bool isRealCluster(void) const {
        return realCluster;
    }

    /**
     * Simulate node failover. In this case mock will disable server
     * corresponding given index an push new configuration. No data
     * rebalancing implemented on the mock.
     *
     * @param index the index of the node on the mock
     * @param bucket the name of the bucket
     */
    void failoverNode(int index, std::string bucket = "default");

    /**
     * Simulate node reconvering. In this case mock will enable server
     * corresponding given index an push new configuration. No data
     * rebalancing implemented on the mock.
     *
     * @param index the index of the node on the mock
     * @param bucket the name of the bucket
     */
    void respawnNode(int index, std::string bucket = "default");


    /**
     * Retrieve the memcached listening ports for a given bucket
     * @param bucket the bucket for which to retrieve memcached port into
     * @return a vector of ports to use.
     */
    std::vector<int> getMcPorts(std::string bucket = "default");

    /**
     * Enable CCCP on the mock cluster
     * @param bucket the bucket on which to enable CCCP
     * @param nodes a list of by-index nodes on which to enable CCCP. If NULL
     * then all nodes are enabled
     * @param bucket the bucket on which to
     */
    void setCCCP(bool enabled,
                 std::string bucket = "",
                 const std::vector<int>* nodes = NULL);

    /**
     * Create a connection to the mock/real server.
     *
     * The instance will be initialized with the the connect parameters
     * to either the mock or a real server (just like makeConnectParams),
     * and call lcb_create. The io instance will be stored in the instance
     * cookie so you may grab it from there.
     *
     * You should call lcb_destroy on the instance when you're done
     * using it.
     *
     * @param instance the instane to create
     */
    void createConnection(lcb_t &instance);

    void createConnection(HandleWrap &handle, lcb_t &instance);

    /**
     * Setup mock to split response in two parts: send first "offset" bytes
     * immediately and send the rest after "msecs" milliseconds.
     *
     * @param msecs the number of milliseconds to wait before sending the
     *              rest of the packet.
     * @param offset the number of the bytes to send in first before delay
     */
    void hiccupNodes(int msecs, int offset);

    ServerVersion getServerVersion(void) const {
        return serverVersion;
    }

    void setServerVersion(ServerVersion ver)  {
        serverVersion = ver;
    }

    void sendCommand(MockCommand &cmd);
    void getResponse(MockResponse &resp);
    void getResponse() { MockResponse tmp; getResponse(tmp); }

    bool hasFeature(const char *feature) {
        return featureRegistry.find(feature) != featureRegistry.end();
    }

    static void printSkipMessage(std::string file, int line, std::string reason) {
        std::cerr << "Skipping " << file << ":" << std::dec << line;
        std::cerr << "(" << reason << ")";
        std::cerr << std::endl;
    }

    MockEnvironment(const char **argv, std::string name = "default");
    virtual ~MockEnvironment();

protected:
    /**
     * Protected destructor to make it to a singleton
     */
    MockEnvironment();
    /**
     * Handle to the one and only instance of the mock environment
     */
    static MockEnvironment *instance;

    void bootstrapRealCluster();
    const struct test_server_info *mock;
    ServerParams serverParams;
    int numNodes;
    bool realCluster;
    ServerVersion serverVersion;
    const char *http;
    lcb_io_opt_st *iops;
    std::set<std::string> featureRegistry;
    std::string bucketName;
    const char **argv;
    void clearAndReset();

private:
    lcb_t innerClient;
    void setupInnerClient();
    void init();
};

#define LCB_TEST_REQUIRE_CLUSTER_VERSION(v) \
    if (!MockEnvironment::getInstance()->isRealCluster()) { \
        MockEnvironment::printSkipMessage(__FILE__, __LINE__, \
                                          "need real cluster"); \
        return; \
    } \
    if (MockEnvironment::getInstance()->getServerVersion() < v) {      \
        MockEnvironment::printSkipMessage(__FILE__, __LINE__, \
                                          "needs higher cluster version"); \
        return; \
    }

#define LCB_TEST_REQUIRE_FEATURE(s) \
    if (!MockEnvironment::getInstance()->hasFeature(s)) { \
        MockEnvironment::printSkipMessage(__FILE__, __LINE__, \
                                          "Feature " s \
                                          " missing in server implementation"); \
        return; \
    }


#endif
