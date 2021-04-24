import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";
chai.use(chai_as_promised);

import { connect, registerUser } from "../src/db/db.js";
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
        afterEach(async () => {
            await User.collection.drop();
        });
        // Test registration
        it("should register user in database", async() => {
            await registerUser("username", "password");
            // We should find a user with username in the database
            var num_users = await User.countDocuments({ "username": "username" });
            num_users.should.be.equal(1); // there should be 1 User with username in db
        });

        // unique registration
        it("should require username to be unique", async () => {
            // create user
            await registerUser("username", "password");
            // attempt to create a second user with same username
            var user = await registerUser("username", "password");
            console.log(user);
            //await expect().to.be.rejectedWith(UniqueUserError);
            var num_users = await User.countDocuments({ "username": "username" });
            num_users.should.be.lessThan(2); // less than 2 should exist, i.e. 1
        });
    });
});