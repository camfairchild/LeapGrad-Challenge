import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import chai, { expect } from "chai";

import { connect, getStockByTicker, registerUser } from "../src/db/db.js";
import Stock from "../src/models/stock.js";
import User from "../src/models/user.js";
import events from "../src/routes/events.js";

import { server } from "../server.js";

var db_connection;

before(() => {
    db_connection = connect(process.env.MONGO_URI_test); // test db
    return db_connection;
});

chai.should();

var token;

before((done) => {
    User.collection.createIndex({ "username": 1 }, { unique: true }).then(() => {
        User.collection.deleteMany().then(() => {
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
                    token = res.body.token;
                    done();
                });
            }).catch((err) => {
                done(err);
            });
        });
    }).catch((err) => {
        done(err);
    });
});

after((done) => {
    User.collection.deleteMany().then(() => {
        done();
    }).catch((err) => {
        done(err);
    });
});

describe("stock live feed", () => {
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

     describe("with valid token", () => {
    

        let io, clientSocket;
      
        before((done) => {
            //const httpServer = createServer();
            io = new Server(server);
            server.listen(() => {
                const port = server.address().port;
                clientSocket = Client(`http://localhost:${port}`, 
                {
                    auth: {
                        token: token
                    }
                });
                events(io);
                clientSocket.on("connect", done);
            });
        });
      
        after(() => {
          io.close();
          clientSocket.close();
        });
        
        // client sends fetch with token
        it("should get list of all stocks on event", (done) => {
            clientSocket.emit("update", (arr) => {
                arr.length.should.eql(2);
                arr[0].should.have.property("ticker").eql("TEST");
                arr[1].should.have.property("ticker").eql("FREE");
                done();
            });
        });
    
        // client should get price updates
        it("should receive price updates", (done) => {
            clientSocket.on("update one", (stock) => {
                stock.should.have.property("price").eql(5.00);
                done();
            });
            // change price of a stock
            getStockByTicker("TEST").then(async (stock_) => {
                stock_.price = 5.00;
                await stock_.save();
                console.log("saved stock");
            })
        });
    });
    
    describe("with invalid token", () => {
        let io, clientSocket;
      
        before((done) => {
            //const httpServer = createServer();
            io = new Server(server);
            server.listen(() => {
                const port = server.address().port;
                clientSocket = Client(`http://localhost:${port}`, 
                    {
                        auth: {
                            token: "fake token"
                        }
                    });
                events(io);
                done();
            });
        });
      
        after(() => {
          io.close();
          clientSocket.close();
        });
    
        // client sends fetch with bad token
        it("should be denied on bad token", (done) => {
            clientSocket.on("connect_error", () => {
                done();
            })
            
            clientSocket.on("connect", () => {
                
            });
        });
    })
})
