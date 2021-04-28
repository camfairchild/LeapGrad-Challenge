import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";

chai.use(chai_as_promised);

import { connect, getUserByUsername, registerUser, updateBalance, getBalance } from "../src/db/db.js";
import User from "../src/models/user.js";
import { UniqueUserError } from "../src/errors/UserRegistrationErrors.js";

var db_connection;

before(() => {
    db_connection = connect(process.env.MONGO_URI_test); // test db
    return db_connection;
});

chai.should();

/** Test
 */
/*describe("db: user", () => {

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
        it("should update user balance", async () => {
            await registerUser("username", "password");
            await updateBalance("username", 10);
            var user_ = await getUserByUsername("username");
            user_.balance.should.equal(10);
        });

        it("should get user balance", async () => {
            await registerUser("username", "password");
            await updateBalance("username", 10);
            let balance = await getBalance("username");
            balance.should.equal(10);
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
        it("should register user in database", async () => {
            await registerUser("test_user", "password");
            // We should find a user with username in the database
            let count = await User.countDocuments({ "username": "username" });
            count.should.be.equal(1); // there should be 1 User with username in db
        });

        // Test registration with empty username
        it("should prevent registering with empty username", async () => {
            registerUser("", "password").should.be.rejectedWith(Error);
            let count = await User.countDocuments();
            count.should.be.equal(0); // there should be no Users in db
        });

        // unique registration
        it("should require username to be unique", (done) => {
            // create user
            await registerUser("username", "password");
            // attempt to create a second user with same username
            registerUser("username", "password") // should error
                .should.be.rejectedWith(UniqueUserError);
            let count = await User.countDocuments({ "username": "username" });
            count.should.be.lessThan(2); // less than 2 should exist, i.e. 1
        });
    });
});*/