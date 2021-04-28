import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";
import chaiHttp from "chai-http";

chai.use(chai_as_promised);
chai.use(chaiHttp);

import { connect, registerUser, updateBalanceByUsername, getBalanceByUsername, getPortfolioByUsername, buyStock, sellStock } from "../src/db/db.js";
import User from "../src/models/user.js";
import Stock from "../src/models/stock.js";
import { server } from "../server.js";

var db_connection;

before(async () => {
    db_connection = connect(process.env.MONGO_URI_test); // test db
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
            let balance = await getBalanceByUsername("username");
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
            await updateBalanceByUsername("username", 10.00);
            // make get to balance endpoint
            let res2 = await chai.request(server)
                .get('/api/account/balance')
                .set({ "Authorization": `Bearer ${token}`});
            res2.should.have.status(200);
            res2.body.should.have.property("balance").eql(10.00);
        });
    });

    describe("portfolio functions", () => {
        before((done) => {
            User.collection.createIndex({ "username": 1 }, { unique: true }).then(() => {
                User.collection.deleteMany().then(() => {
                    Stock.collection.deleteMany().then(async () => {
                        var t = new Stock({
                            company: "test",
                            ticker: "TEST",
                            price: 2.00
                        });
                        
                        await t.save();
        
                        var f = new Stock({
                            company: "free",
                            ticker: "FREE",
                            price: 0.00
                        });
        
                        await f.save();
                        done();
                    }).catch((err) => {
                        done(err);
                    });
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

        // Integration test of user get portfolio
        it("should get user portfolio", async () => {
            await registerUser("username", "password");

            buyStock("username", "FREE", 1); // price is 0.00

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
            // make get to portfolio endpoint
            let res2 = await chai.request(server)
                .get('/api/account/portfolio')
                .set({ "Authorization": `Bearer ${token}`})
            res2.should.have.status(200);
            res2.should.have.property("portfolio").get("FREE").should.be.eql(1);
        });

        it("should buy stock for user", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 10.00); // make balance = 10.00

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
            // make get to portfolio buy endpoint
            let res2 = await chai.request(server)
                .post('/api/account/portfolio/buy')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: 1
                });
            res2.should.have.status(200);
            var pf = await getPortfolioByUsername("username");
            pf.get("TEST").should.be.eql(1);
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(8.00); // 10.00 - 2.00 === 8.00
        });

        it("should sell some stock for user", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 10.00); // make balance = 10.00
            await buyStock("username", "TEST", 2); // buy 2 of TEST for 2.00 * 2 = 4.00
            (await getBalanceByUsername("username")).should.be.eql(6.00); // balance is now 6.00

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
            // make get to portfolio sell endpoint
            let res2 = await chai.request(server)
                .post('/api/account/portfolio/sell')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: 1
                });
            res2.should.have.status(200);
            var pf = await getPortfolioByUsername("username");
            pf.get("TEST").should.be.eql(1); // has 1 left
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(8.00); // 6.00 + 2.00 === 8.00
        });

        it("should sell all stock for user", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 10.00); // make balance = 10.00
            await buyStock("username", "TEST", 1); // buy 1 of TEST for 2.00
            (await getBalanceByUsername("username")).should.be.eql(8.00); // balance is now 8.00

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
            // make get to portfolio sell endpoint
            let res2 = await chai.request(server)
                .post('/api/account/portfolio/sell')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: 1
                });
            res2.should.have.status(200);
            var pf = await getPortfolioByUsername("username");
            pf.has("TEST").should.be.false; // has none left, ticker removed
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(10.00); // 8.00 + 2.00 === 10.00
        });

        it("should only sell stock if user has enough shares", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 10.00); // make balance = 10.00
            await buyStock("username", "TEST", 1); // buy 1 of TEST for 2.00
            (await getBalanceByUsername("username")).should.be.eql(8.00); // balance is now 8.00

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
            // make get to portfolio sell endpoint
            let res2 = await chai.request(server)
                .post('/api/account/portfolio/sell')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: 2 // user only has 1
                });
            res2.should.have.status(200);
            res2.should.have.property("error").eql("Your portfolio doesn't have enough of that stock to remove!");
            var pf = await getPortfolioByUsername("username");
            pf.has("TEST").should.be.true; // has 1 left, nothing sold
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(8.00); // balance unchanged
        });

        it("should only buy stock if user has enough funds", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 1.00); // make balance = 1.00

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
            // make get to portfolio buy endpoint
            let res2 = await chai.request(server)
                .post('/api/account/portfolio/buy')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: 1 // user only has $1.00
                });
            res2.should.have.status(200);
            res2.should.have.property("error").eql("Your balance isn't high enough!");
            var pf = await getPortfolioByUsername("username");
            pf.has("TEST").should.be.false; // couldn't buy
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(1.00); // balance unchanged
        });

        it("should only take valid input", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 5.00); // make balance = 1.00
            buyStock("username", "TEST", 1); // balance == 3.00, TEST: 1

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

            // ===== SELLING ======
            // make post to portfolio sell endpoint
            let res2 = await chai.request(server)
                .post('/api/account/portfolio/sell')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: "a" // invalid input
                });
            res2.should.have.status(200);
            res2.should.have.property("error");

            // make post to portfolio sell endpoint
            let res3 = await chai.request(server)
                .post('/api/account/portfolio/sell')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: -1 // invalid input
                });
            res3.should.have.status(200);
            res3.should.have.property("error");

            // make post to portfolio sell endpoint
            let res4 = await chai.request(server)
                .post('/api/account/portfolio/sell')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: NaN // invalid input
                });
            res4.should.have.status(200);
            res4.should.have.property("error");

            // ========= BUYING ==========

            // make post to portfolio buy endpoint
            let res5 = await chai.request(server)
                .post('/api/account/portfolio/buy')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: "a" // invalid input
                });
            res5.should.have.status(200);
            res5.should.have.property("error");

            let res6 = await chai.request(server)
                .post('/api/account/portfolio/buy')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: -1 // invalid input
                });
            res6.should.have.status(200);
            res6.should.have.property("error");

            // make post to portfolio buy endpoint
            let res7 = await chai.request(server)
                .post('/api/account/portfolio/buy')
                .set({ "Authorization": `Bearer ${token}`})
                .send({
                    ticker: "TEST", // has price of 2.00
                    amount: NaN // invalid input
                });
            res7.should.have.status(200);
            res7.should.have.property("error");

            var pf = await getPortfolioByUsername("username");
            pf.has("TEST").should.be.false; // couldn't buy
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(1.00); // balance unchanged
        });
    });
});