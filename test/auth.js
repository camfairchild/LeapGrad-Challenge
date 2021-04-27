import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";
import chaiHttp from "chai-http";

chai.use(chai_as_promised);
chai.use(chaiHttp);

import { connect, registerUser, loginUser } from "../src/db/db.js";
import User from "../src/models/user.js";
import { server } from "../server.js";

var db_connection;

before(async () => {
    db_connection = await connect(process.env.MONGO_URI_test); // test db
    return db_connection;
});

chai.should();

/** Test
 */
describe("auth api endpoints", () => {

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
                    loginUser("test_user", "password", (err, user) => {
                        expect(err).to.be.null;
                        user.should.have.property("username").eql("test_user");
                    });
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