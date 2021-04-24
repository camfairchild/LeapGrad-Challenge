import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";
chai.use(chai_as_promised);

import { connect, registerUser, loginUser } from "../src/db/db.js";
import User from "../src/models/user.js";
import { UniqueUserError } from "../src/errors/UserRegistrationErrors.js";

var db_connection;

before(async () => {
    db_connection = connect(process.env.MONGO_URI_test); // test db
});

chai.should();

/** Test
 */
describe("user", () => {

    describe("user registration", () => {
        before(async () => {
            await User.collection.createIndex({ "username": 1 }, { unique: true });
            await User.collection.deleteMany({});
        });
    
        afterEach(async () => {
            await User.collection.deleteMany({});
        });
        // Test registration
        it("should register user in database", async() => {
            await registerUser("username", "password");
            // We should find a user with username in the database
            var num_users = await User.countDocuments({ "username": "username" });
            num_users.should.be.equal(1); // there should be 1 User with username in db
        });

        // Test registration with empty username
        it("should register user in database", async() => {
            registerUser("", "password").should.be.rejectedWith(Error);
            var num_users = await User.countDocuments({});
            num_users.should.be.equal(0); // there should be no Users in db
        });

        // unique registration
        it("should require username to be unique", async () => {
            // create user
            await registerUser("username", "password");
            // attempt to create a second user with same username
            registerUser("username", "password") // should error
                .should.be.rejectedWith(UniqueUserError);
            
            var num_users = await User.countDocuments({ "username": "username" });
            num_users.should.be.lessThan(2); // less than 2 should exist, i.e. 1
        });
    });

    describe("user login", () => {
        before(async () => {
            await User.collection.createIndex({ "username": 1 }, { unique: true });
            await User.collection.deleteMany({});
        });
    
        afterEach(async () => {
            await User.collection.deleteMany({});
        });
        // Test registration
        it("should login user", async() => {
            await registerUser("username", "password"); // registers user
            // try to login user
            var result = await loginUser("username", "password");
            result.should.be.true();
        });
    });
});