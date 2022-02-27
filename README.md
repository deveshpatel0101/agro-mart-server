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
4. Before starting the development server you need to set an environmental variable. Set `jwtKey` value found in `/config/default.json` file.
5. Once dependencies are installed, now it's time to start development server. Run `node app.js` command to start localhost server. The server will start on [http://localhost:5000](http://localhost:5000).

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
