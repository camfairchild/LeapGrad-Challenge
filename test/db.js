import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";

chai.use(chai_as_promised);

import { connect, getUserByUsername, registerUser, updateBalance, getBalance } from "../src/db/db.js";
import User from "../src/models/user.js";
import { UniqueUserError } from "../src/errors/UserRegistrationErrors.js";

var db_connection;

before(async () => {
    db_connection = await connect(process.env.MONGO_URI_test); // test db
    return db_connection;
});

chai.should();

/** Test
 */
describe("db: user", () => {

    describe("user functions", () => {
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
        it("should update user balance", (done) => {
            registerUser("username", "password").then(() => {
                updateBalance("username", 10, (err) => {
                    expect(err).to.be.null;
                    getUserByUsername("username", (err, user) => {
                        expect(err).to.be.null;
                        user.balance.should.equal(10);
                        done();
                    });
                });
            }).catch((err) => {
                done(err);
            })
        });

        it("should get user balance", () => {
            registerUser("username", "password").then(() => {
                updateBalance("username", 10, (err) => {
                    expect(err).to.be.null;
                    getBalance("username", (err, balance) => {
                        expect(err).to.be.null;
                        balance.should.equal(10);
                    })
                });
            }).catch((err) => {
                done(err);
            })
        });
    });

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
            registerUser("test_user", "password").then(() => {
                // We should find a user with username in the database
                User.countDocuments({ "username": "username" }, (err, count) => {
                    expect(err).to.be.null;
                    count.should.be.equal(1); // there should be 1 User with username in db
                    done();
                })
            }).catch((err) => {
                done(err);
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
            }).catch((err) => {
                done(err);
            });
        });
    });
});