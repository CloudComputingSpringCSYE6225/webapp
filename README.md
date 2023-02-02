# WebApp - CSYE 6225

## <ins>By Rebecca Biju : 002768633</ins>
---

### What is this?
Backend API  using Node and ExpressJS to create a user (unauthorized route) and get and update a particular user (authorized route).
The Database used is PostgreSQL.
I have used the IntelliJ IDE for development. 
Base64 Authentication is implemented.

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