import dotenv from 'dotenv'
dotenv.config();

import chai, { expect, should } from "chai";
import chai_as_promised from "chai-as-promised";

chai.use(chai_as_promised);

import { OutOfStockError, NonWholeStockQuantityError } from "../src/errors/StockErrors.js";
import { createUser } from '../src/user.js';
import { removeStock, addStock, getPortfolio } from '../src/stock.js';

chai.should();

/** Test
 */
describe("stock", () => {

    describe("portfolio management", () => {

        it("should be able to add some stock", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            addStock(user, "APPL", 5);
            let portfolio = getPortfolio(user);
            console.log(portfolio);
            portfolio.size.should.be.greaterThan(0);
            portfolio.get("APPL").should.be.eql(5);
        });

        it("should only be able to add whole numbers of stock", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            (() => addStock(user, "APPL", 2.5)).should.throw(NonWholeStockQuantityError);
            // err because of float
            let portfolio = getPortfolio(user);
            portfolio.has("AAPL").should.be.false; // no stock added
        });

        it("should be able to remove all stock", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            addStock(user, "APPL", 5);
            removeStock(user, "APPL", 5);
            let portfolio = getPortfolio(user);
            portfolio.size.should.eql(0);
        });

        it("should be able to remove some stock", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            addStock(user, "APPL", 5);
            removeStock(user, "APPL", 3);
            let portfolio = getPortfolio(user);
            portfolio.size.should.be.greaterThan(0);
            portfolio.has("APPL").should.be.true;
            portfolio.get("APPL").should.eql(2); // 5 - 3 === 2
        });

        it("should only be able to remove whole numbers of stock", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            addStock(user, "APPL", 5);
            (() => removeStock(user, "APPL", 3.5)).should.throw(NonWholeStockQuantityError);
            // err because of float
            let portfolio = await getPortfolio(user);
            portfolio.get("APPL").should.eql(5); // no stock removed
        });

        it("should only be able to remove stock that the user has left", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            addStock(user, "APPL", 2);
            (() => removeStock(user, "APPL", 5)).should.throw(OutOfStockError);
            // err because user doesnt have 5 shares
            let portfolio = await getPortfolio(user);
            portfolio.get("APPL").should.eql(2); // no stock removed
        });

        it("should error on invalid inputs", async () => {
            let username = "username";
            let password = "password";
            var user = await createUser(username, password);
            (() => addStock(user, "APPL", "a")).should.throw(NonWholeStockQuantityError);
            (() => removeStock(user, "APPL", "b")).should.throw(NonWholeStockQuantityError);
            (() => removeStock(user, "APPL", "-1")).should.throw(NonWholeStockQuantityError);
            (() => removeStock(user, "APPL", -1)).should.throw(NonWholeStockQuantityError);            
            (() => removeStock(user, "APPL", NaN)).should.throw(NonWholeStockQuantityError);
            // err because of invalid inputs
            let portfolio = getPortfolio(user);
            portfolio.has("AAPL").should.be.false; // no stock added/removed
        });
    });
});