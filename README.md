# LeapGrad Interview Challenge - Task 2
## Assignment Instructions
Build a stock market tracking system.
### Section 1
Your system should have
- [ x ] support for users to login/logout.
- [ x ] Users should be able to add balance to their wallet.
- [ x ] Users should be able to buy/sell shares (transactions need not be stored)
- [ ] Users should be able to subscribe to an endpoint that should provide live rates.
- [ x ] Users should have the ability to see their portfolio
    
The code you write is expected to be good quality, it should:
* Have correct formatting
* Have resilient error handling
* Exceptions should appropriate handling
* Architecture should be scalable, easy to maintain
* Tricky parts of the code should have proper documentation
* Database queries should be *efficient*

-----
Along with your code, please provide instructions on how torun it.

Make a small doc highlighting the sections you’re proud of! (It can also include other github repositories you have worked on in the past)

___
# Installation Instructions
## Requirements
- NodeJS (^15.11.0)
- yarn (or npm, etc.)
- MongoDB Instance (I used a free Atlas cluster)

### Download
Either download the source code from the repo or clone it locally using `git clone`

    git clone https://github.com/camfairchild/LeapGrad-Challenge

Then unzip (if you downloaded) and enter the directory.

    cd LeapGrad-Challenge-main/

### Install
Either using yarn or npm

    yarn install

### Run

    yarn run start

### Endpoints

##### Note: to logout, the user can just forget the JWT token. Requesting a new token when logging in again.

#### <span style="color:yellow">POST</span> /api/auth/register
Body:  
    ```
    {
        "username": <username>,
        "password": <password>
    }
    ```

Response:  
<span style="color:#30c821">200</span>  
    ```
    {
        "message": "Registration successful!",
        "user": <user Object>
    }
    ```

<span style="color:red">422</span>  
    ```
    {
        "message": "Registration unsuccessful"
    }
    ```

#### <span style="color:yellow">POST</span> /api/auth/login
Body:  
    ```
    {
        "username": <username>,
        "password": <password>
    }
    ```

Response:  
<span style="color:#30c821">200</span>  
    ```
    {
        "message": "Login successful!",
        "token": <bearer token string>
    }
    ```

<span style="color:red">401</span>  
    ```
    {
        "error": "Incorrect credentials"
    }
    ```

<!---
#### <span style="color:yellow">POST</span> /api/auth/logout
Headers:  
    ```
    {
        Authorization: "Bearer {{jwt_token}}
    }
    ```

Body:  
    ```
    {}
    ```

Response:  
<span style="color:#30c821">200</span>  
    ```
    {
        "message": "Logout successful!"
    }
    ```

<span style="color:red">401</span>  
    ```
    Unauthorized
    ```
--->

#### <span style="color:#30c821">GET</span> /api/account/balance
Headers:  
    ```
    {
        Authorization: "Bearer {{jwt_token}}
    }
    ```

Parameters:  
    ```
    {}
    ```

Response:  
<span style="color:#30c821">200</span>  
    ```
    {
        "balance": <account balance>
    }
    ```

<span style="color:red">401</span>  
    ```
    Unauthorized
    ```

#### <span style="color:yellow">POST</span> /api/account/balance
Headers:  
    ```
    {
        Authorization: "Bearer {{jwt_token}}
    }
    ```

Body:  
    ```
    {
        "amount": <numeric increase to balance>
    }
    ```

Response:  
<span style="color:#30c821">200</span>  
    ```
    {
        "balance": <account balance>
    }
    ```

<span style="color:red">401</span>  
    ```
    Unauthorized
    ```

#### <span style="color:#30c821">GET</span> /api/account/portfolio
Headers:  
    ```
    {
        Authorization: "Bearer {{jwt_token}}
    }
    ```

Params:  
    ```
    {}
    ```

Response:  
<span style="color:#30c821">200</span>  
    ```
    {
        "portfolio": {
            <ticker>: <amount>
        }
    }
    ```

<span style="color:red">401</span>  
    ```
    Unauthorized
    ```

#### <span style="color:yellow">POST</span> /api/account/portfolio/buy
Headers:  
    ```
    {
        Authorization: "Bearer {{jwt_token}}
    }
    ```

Body:  
    ```
    {
        ticker: String,
        amount: Number
    }
    ```

Response:  
With enough balance:
<span style="color:#30c821">200</span>  
    ```
    {
        message: "Success!",
        action: "BUY",
        stock: {
            ticker: String,
            company: String,
            price: Number
        },
        amount: Number
    }
    ```
User Error
<span style="color:#30c821">200</span>  
    ```
    {
        error: String
    }
    ```

Server Error
<span style="color:red">500</span>  
    ```
    {
        <error string>
    }
    ```

<span style="color:red">401</span>  
    ```
    Unauthorized
    ```

#### <span style="color:yellow">POST</span> /api/account/portfolio/sell
Headers:  
    ```
    {
        Authorization: "Bearer {{jwt_token}}
    }
    ```

Body:  
    ```
    {
        ticker: String,
        amount: Number
    }
    ```

Response:  
With enough shares:
<span style="color:#30c821">200</span>  
    ```
    {
        message: "Success!",
        action: "SELL",
        stock: {
            ticker: String,
            company: String,
            price: Number
        },
        amount: Number
    }
    ```
User Error
<span style="color:#30c821">200</span>  
    ```
    {
        error: String
    }
    ```

Server Error
<span style="color:red">500</span>  
    ```
    {
        <error string>
    }
    ```

<span style="color:red">401</span>  
    ```
    Unauthorized
    ```

### Test

    yarn run test
