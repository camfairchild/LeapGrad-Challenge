import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";

chai.use(chai_as_promised);

import { checkLogin, createUser } from '../src/user.js';
import { UserRegistrationError } from "../src/errors/UserRegistrationErrors.js";

chai.should();

/** Test
 */
describe("user", () => {

    describe("user creation", () => {

        // Test user creation
        it("should hash the password", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            user.password_hash.should.not.equal(password);
        });

        // Test creation with empty username
        it("should prevent registering with empty username", () => {
            createUser("", "password").should.be.rejectedWith(UserRegistrationError);
        });
    });

    describe("user login", () => {

        // Test checkLogin
        it("should be correct credentials for new user", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            checkLogin(user, password, (err, user_) => {
                expect(err).to.be.null;
                user_.username.should.be.equal(username);
            });
        });
    });
});