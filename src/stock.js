import { OutOfStockError, NonWholeStockQuantityError } from "../src/errors/StockErrors.js";

// https://stackoverflow.com/a/16799758
function isNaturalNumber(n) {
    return n >= 0 && Math.floor(n) === +n;
}

export function removeStock(user, ticker, amount) {
    if (typeof(amount) !== "number" || !isNaturalNumber(amount)) {
        throw new NonWholeStockQuantityError("Stock amount must be a whole number!");
    }
    if (!user.portfolio.has(ticker)) {
        // doesnt have any of this stock
        throw new OutOfStockError("Your portfolio doesn't have any of that stock to remove!");
    } else {
        // has the stock
        const qty = user.portfolio.get(ticker);
        if (amount > qty) {
            throw new OutOfStockError("Your portfolio doesn't have enough of that stock to remove!");
        } else if (amount === qty) {
            // remove the stock from the portfolio entirely
            user.portfolio.delete(ticker);
        } else {
            // amount < quantity of shares of ticker
            user.portfolio.set(ticker, qty - amount);
        }
    }
}

export function addStock(user, ticker, amount) {
    if (typeof(amount) !== "number" || !isNaturalNumber(amount)) {
        throw new NonWholeStockQuantityError("Stock amount must be a whole number!");
    }
    if (!user.portfolio.has(ticker)) {
        user.portfolio.set(ticker, amount);
    } else {
        var qty = user.portfolio.get(ticker);
        user.portfolio.set(ticker, qty + amount);
    }
}

export function getPortfolio(user) {
    return user.portfolio;
}