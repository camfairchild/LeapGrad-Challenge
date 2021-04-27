import dotenv from 'dotenv'
dotenv.config();

import chai, { expect, should } from "chai";
import chai_as_promised from "chai-as-promised";
import chaiHttp from "chai-http";

chai.use(chai_as_promised);
chai.use(chaiHttp);

import { connect, loginUser, registerUser, checkLogin } from "../src/db/db.js";
import User from "../src/models/user.js";
import { UniqueUserError } from "../src/errors/UserRegistrationErrors.js";
import { server } from "../server.js";

var db_connection;

before(async () => {
    db_connection = await connect(process.env.MONGO_URI_test); // test db
    return db_connection;
});

chai.should();

/** Test
 */
describe("user", () => {

    describe("user registration", () => {
        before((done) => {
            User.collection.createIndex({ "username": 1 }, { unique: true }).then(() => {
                User.collection.deleteMany().then(() => {
                    done();
                });
            }).catch((err) => {
                done(err);
            });
        });
        
        afterEach((done) => {
            User.collection.deleteMany().then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
        });

        // Test registration
        it("should register user in database", (done) => {
            registerUser("username", "password").then((user) => {
                // We should find a user with username in the database
                User.countDocuments({ "username": "username" }, (err, count) => {
                    expect(err).to.be.null;
                    count.should.be.equal(1); // there should be 1 User with username in db
                    done();
                })
            })
            
        });

        // Test registration with empty username
        it("should prevent registering with empty username", (done) => {
            registerUser("", "password").should.be.rejectedWith(Error);
            User.countDocuments({}, (err, count) => {
                expect(err).to.be.null;
                count.should.be.equal(0); // there should be no Users in db
                done();
            });
        });

        // unique registration
        it("should require username to be unique", (done) => {
            // create user
            registerUser("username", "password").then(() => {
                // attempt to create a second user with same username
                registerUser("username", "password") // should error
                .should.be.rejectedWith(UniqueUserError);
                User.countDocuments({ "username": "username" }, (err, count) => {
                    expect(err).to.be.null;
                    count.should.be.lessThan(2); // less than 2 should exist, i.e. 1
                    done();
                });
            });
        });

        // integration test for /api/register endpoint
        it("should allow api registration", (done) => {
            // make post to register endpoint
            chai.request(server)
                .post('/api/auth/register')
                .send({
                    username: "test_user", // possible race between tests
                    password: "password"
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.have.property("user").not.null;
                    done();
                });
        });
    });

    describe("user login", () => {
        before((done) => {
            User.collection.createIndex({ "username": 1 }, { unique: true }).then(() => {
                User.collection.deleteMany().then(() => {
                    done();
                }).catch((err) => {
                    done(err);
                });
            }).catch((err) => {
                done(err);
            });
        });
        
        afterEach((done) => {
            User.collection.deleteMany().then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
        });

        // Test check credentials
        it("should be correct credentials for new user", (done) => {
            registerUser("username", "password").then((user) => {
                expect(user).to.not.be.null;
                // check user login
                checkLogin(user, "password", (err, user_) => {
                    expect(err).to.be.null;
                    user_.should.not.be.false;
                }).then(() => {
                    done();
                }).catch((err) => {
                    done(err);
                })
            }).catch((err) => {
                done(err);
            });
        });

        // Test user login
        it("should login new user", (done) => {
            registerUser("username", "password").then(() => {
                // try login
                loginUser("username", "password", (err, user) => {
                    expect(err).to.be.null;
                    user.should.have.property("username").equal("username");
                }).then(() => {
                    done()
                }).catch((err) => {
                    done(err);
                })
            }).catch((err) => {
                done(err)
            });
        });

        // Integration test of user login
        it("should give valid session for login", (done) => {
            registerUser("username", "password").then(() => {
                // login user
                // make post to login endpoint
                chai.request(server)
                .post('/api/auth/login')
                .send({
                    username: "username",
                    password: "password"
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.have.property("token").not.null;
                    done();
                });
            }).catch((err) => {
                done(err);
            });
        });
    });
});