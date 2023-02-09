# WebApp - CSYE 6225

## <ins>By Rebecca Biju : 002768633</ins>
---

### About
Backend API using Node and ExpressJS to perform CRUD operations on users and products.
The Database used is PostgreSQL.
I have used the IntelliJ IDE for development. 
Base64 Authentication is implemented.

#### Routes
> User Routes
- `GET v1/user/{userId}` Get User Account Information
- `PUT v1/user/{userId}` Update User's account information
- `POST v1/user` Creates a user account (unauthenticated)

> Product Routes
- `GET v1/product/{productId}` Get Product Information (unauthenticated)
- `POST v1/product` Add new product
- `PUT v1/product/{productId}` Update Product information
- `PATCH v1/product/{productId}` Update Product information
- `DELETE v1/product/{productId}` Delete Product information

> Health Route
- `GET /healthz` Health endpoint

### Prerequisites
- `git` (configured with ssh) [[link](https://git-scm.com/downloads)]
- `node` [[link](https://nodejs.org/en/download/)]
- `Postman` for API testing [[link](https://www.postman.com/downloads/)]
- `env` file for local Postgres step

#### How to run?
1. Clone the repository from Organization
    ```shell
      git clone git@github.com:CloudComputingSpringCSYE6225/webapp.git
    ```
2. Install the dependencies
   ```shell
      npm i
    ```
3. Run the program in dev mode
   ```shell
      npm run dev
    ```

#### How to test?
The test cases are written using Jest and Supertest. There are two test cases to test the health and invalid routes respectively.

The command to run the tests is :
   ```shell
      npm run test
   ```