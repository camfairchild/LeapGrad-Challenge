export class StockError extends Error {};

export class StockQuantityError extends StockError {};

export class OutOfStockError extends StockQuantityError {};

export class NonWholeStockQuantityError extends StockQuantityError {};

export class OutOfFundsError extends StockError {};

export class TickerDoesNotExistError extends StockError {};