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

        // integration test for /api/register endpoint
        it("should allow api registration", async () => {
            // make post to register endpoint
            chai.request(server)
                .post('/api/register')
                .send({
                    username: "username",
                    password: "password"
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.should.have.property("user").not.null;
                });
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

        // Test check credentials
        it("should be correct credentials for new user", async() => {
            var user = await registerUser("username", "password"); // registers user
            expect(user).to.not.be.null;
            // check user login
            checkLogin(user, "password", (err, user_) => {
                expect(err).to.be.null;
                user_.should.not.be.false;
            });
        });

        // Test user login
        it("should login new user", async () => {
            await registerUser("username", "password"); // registers user
            // try login
            loginUser("username", "password", (err, user) => {
                expect(err).to.be.null;
                user.should.have.property("username").equal("username");
            });
        });

        // Integration test of user login
        it("should give valid session for login", async () => {
            await registerUser("username", "password"); // registers user
            // login user
            // make post to login endpoint
            chai.request(server)
                .post('/api/login')
                .send({
                    username: "username",
                    password: "password"
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.should.have.property("token");
                });
        });
    });
});