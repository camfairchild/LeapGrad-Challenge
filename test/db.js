import dotenv from 'dotenv'
dotenv.config();

import chai, { expect } from "chai";
import chai_as_promised from "chai-as-promised";

chai.use(chai_as_promised);

import { connect, getUserByUsername, registerUser, updateBalanceByUsername, getBalanceByUsername, getPortfolioByUsername, buyStock, sellStock, getStockByTicker, getAllStocks } from "../src/db/db.js";
import { OutOfStockError, NonWholeStockQuantityError, OutOfFundsError, TickerDoesNotExistError } from "../src/errors/StockErrors.js";
import User from "../src/models/user.js";
import Stock from "../src/models/stock.js";
import { UniqueUserError } from "../src/errors/UserRegistrationErrors.js";

var db_connection;

before(() => {
    db_connection = connect(process.env.MONGO_URI_test); // test db
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
        it("should update user balance", async () => {
            await registerUser("username", "password");
            await updateBalanceByUsername("username", 10);
            var user_ = await getUserByUsername("username");
            user_.balance.should.equal(10);
        });

        it("should get user balance", async () => {
            await registerUser("username", "password");
            await updateBalanceByUsername("username", 10);
            let balance = await getBalanceByUsername("username");
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
            let count = await User.countDocuments({ "username": "test_user" });
            count.should.be.equal(1); // there should be 1 User with username in db
        });

        // Test registration with empty username
        it("should prevent registering with empty username", async () => {
            registerUser("", "password").should.be.rejectedWith(Error);
            let count = await User.countDocuments();
            count.should.be.equal(0); // there should be no Users in db
        });

        // unique registration
        it("should require username to be unique", async () => {
            // create user
            await registerUser("username", "password");
            // attempt to create a second user with same username
            registerUser("username", "password") // should error
                .should.be.rejectedWith(UniqueUserError);
            let count = await User.countDocuments({ "username": "username" });
            count.should.be.lessThan(2); // less than 2 should exist, i.e. 1
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

        // unit test of user get portfolio
        it("should get user portfolio", async () => {
            await registerUser("username", "password");

            await buyStock("username", "FREE", 1); // price is 0.00

            (await getPortfolioByUsername("username")).get("FREE").should.eql(1);
        });

        it("should buy stock for user", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 10.00); // make balance = 10.00

            await buyStock("username", "TEST", 1);

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

            await sellStock("username", "TEST", 1);

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

            await sellStock("username", "TEST", 1);
            
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

            sellStock("username", "TEST", 2).should.be.rejectedWith(OutOfStockError);
            
            var pf = await getPortfolioByUsername("username");
            pf.has("TEST").should.be.true; // has 1 left, nothing sold
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(8.00); // balance unchanged
        });

        it("should only buy stock if user has enough funds", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 1.00); // make balance = 1.00

            buyStock("username", "TEST", 1).should.be.rejectedWith(OutOfFundsError);

            var pf = await getPortfolioByUsername("username");
            pf.has("TEST").should.be.false; // couldn't buy
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(1.00); // balance unchanged
        });

        it("should only take valid input", async () => {
            await registerUser("username", "password");
            
            await updateBalanceByUsername("username", 5.00); // make balance = 1.00
            await buyStock("username", "TEST", 1); // balance == 3.00, TEST: 1

            buyStock("username", "TEST", -1).should.be.rejectedWith(NonWholeStockQuantityError);
            buyStock("username", "TEST", NaN).should.be.rejectedWith(NonWholeStockQuantityError);
            buyStock("username", "TEST", "a").should.be.rejectedWith(NonWholeStockQuantityError);

            sellStock("username", "TEST", -1).should.be.rejectedWith(NonWholeStockQuantityError);
            sellStock("username", "TEST", NaN).should.be.rejectedWith(NonWholeStockQuantityError);
            sellStock("username", "TEST", "a").should.be.rejectedWith(NonWholeStockQuantityError);

            var pf = await getPortfolioByUsername("username");
            pf.get("TEST").should.be.eql(1); // couldn't buy more than 1
            var balance = await getBalanceByUsername("username");
            balance.should.be.eql(3.00); // balance unchanged
        });
    });

    describe("stock", () => {
        before((done) => {
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
        });

        it("should get stock from ticker", async () => {
            var t = await getStockByTicker("TEST");
            t.should.have.property("company").eql("test");
            var f = await getStockByTicker("FREE");
            f.should.have.property("company").eql("free");
        });

        it("should not get invalid ticker", async () => {
            getStockByTicker("FAKE").should.be.rejectedWith(TickerDoesNotExistError);
            getStockByTicker("").should.be.rejectedWith(TickerDoesNotExistError);
        });

        it("should provide a list of all stocks and info", async () => {
            var a = await getAllStocks();
            a.length.should.eql(2);
            a[0].should.have.property("ticker").eql("TEST");
            a[1].should.have.property("ticker").eql("FREE");
        });
    });
});