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
        it("should set user balance", async () => {
            await registerUser("username", "password");
            // login user
            let res = await chai.request(server)
                .post('/api/auth/login')
                .send({
                    username: "username",
                    password: "password"
                });
            res.should.have.status(200);
            // set jwt token
            var token = res.body.token;
            // make post to balance endpoint
            let res2 = await chai.request(server)
                .post('/api/account/balance')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    amount: 10.00
                })
            res2.should.have.status(200);
            let balance = await getBalance("username");
            balance.should.be.eql(10.00);
        });

        it("should disallow non-numeric balance update input", async () => {
            await registerUser("username", "password");
            // login user
            let res = await chai.request(server)
                .post('/api/auth/login')
                .send({
                    username: "username",
                    password: "password"
                });
            // set jwt token
            var token = res.body.token;
            // make post to balance endpoint
            let res2 = await chai.request(server)
                .post('/api/account/balance')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    amount: "invalid input"
                })
            res2.should.have.status(422);
            res2.body.should.have.property("error").equal("Invalid amount");
        });

        // Integration test of user get balance
        it("should get user balance", async () => {
            await registerUser("username", "password");
            // login user
            let res = await chai.request(server)
                .post('/api/auth/login')
                .send({
                    username: "username",
                    password: "password"
                });
            // get jwt token
            var token = res.body.token;
            // set user balance
            await updateBalance("username", 10.00);
            // make get to balance endpoint
            let res2 = await chai.request(server)
                .get('/api/account/balance')
                .set({ "Authorization": `Bearer ${token}`});
            res2.should.have.status(200);
            res2.body.should.have.property("balance").eql(10.00);
        });
    });
});