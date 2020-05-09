## Agro-Mart-Server

### Table of Contents

1. Instructions
2. Dependencies
3. Description
4. Contributions

### Instructions

#### Development

Follow below steps to start development environment:

1. Download or clone this repository.
2. cd into this folder `cd agro-mart-server`.
3. Install the required dependencies using `npm install` command.
4. Before starting the development server you need to set two environmental variables. Skip this step if you don't want to set environmental variables permanently. However you will still need to set these variables while starting the server.

   - `export AGRO_MART_JWT_KEY=your_jwt_key`
   - `export AGRO_MART_GOOGLE_CLIENT_ID=your_google_client_id`

**Note**: The above google client id must similar to one used in [agro-mart-client](https://github.com/deveshpatel0101/agro-mart-client) project.

5. Once dependencies are installed, now it's time to start development server. Follow below steps:
   - If you have followed `step:4` then run `node app.js` command to start localhost server. A new tab will automatically open in your default browser if not then the server will be started on [http://localhost:5000](http://localhost:5000).
   - If you have skipped `step:4` then run `AGRO_MART_JWT_KEY=your_jwt_key AGRO_MART_GOOGLE_CLIENT_ID=your_google_client_id node app.js` command

**Note**: If you want auto-reload on changing files then make use of nodemon package. You just need to replace `node` with `nodemon` in above `step: 5`.

#### Testing

Follow below steps to start test environment:

- If you want to run all tests (unit and integration) then run `npm test` command. This command will also eject the coverage files showing how much code has been tested.
- If you want to run just unit tests then run `npm test-unit` command.
- If you want to run just integration tests then run `npm test-integration` command.

### Dependencies

All required development and production dependencies are listed in package.json file.

### Description

This application is integrated with frontend part of `agro-mart-client` project. You can find it's source code [here](https://github.com/deveshpatel0101/agro-mart-client).

This application provides RESTful API's to the frontend part of above mentioned project.

### Contributions

Feel free to raise an issue if you find any and also feel free to contribute to this project. Raise a pull request of the solution 😄.

```
HAPPY CODING 💻
HAPPY LEARNING 📚
```
