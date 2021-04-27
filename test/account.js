import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";
import chaiHttp from "chai-http";

chai.use(chai_as_promised);
chai.use(chaiHttp);

import { connect, registerUser, loginUser, updateBalance, getBalance } from "../src/db/db.js";
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
describe("account api endpoints", () => {

    describe("user functions", () => {
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

        // Integration test of user update balance
        it("should get user balance", (done) => {
            registerUser("username", "password").then(() => {
                // login user
                // make post to balance endpoint
                chai.request(server)
                .post('/api/account/balance')
                .send({
                    amount: 10.00
                })
                .auth("username", "password")
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    getBalance("username", (err, balance) => {
                        expect(err).to.be.null;
                        balance.should.eql(10.00);
                    })
                    done();
                });
                
            }).catch((err) => {
                done(err);
            });
        });

        // Integration test of user get balance
        it("should get user balance", (done) => {
            registerUser("username", "password").then(() => {
                // set user balance
                updateBalance("username", 10.00, (err) => {
                    // login user
                    // make get to balance endpoint
                    chai.request(server)
                    .get('/api/account/balance')
                    .auth("username", "password")
                    .end((err, res) => {
                        expect(err).to.be.null;
                        res.should.have.status(200);
                        res.body.should.have.property("balance").eql(10.00);
                        done();
                    });
                })
                
            }).catch((err) => {
                done(err);
            });
        });


    });
});