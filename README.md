# News API

## Link to hosted API version

https://nc-news-9duf.onrender.com



## Project summary:

To build an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

This database is PSQL, and we will interact with it using [node-postgres](https://node-postgres.com/).

Versions Node.js "v19.0.0" and Postgres "^8.7.3" are needed to run this repo.



## Clone this repo:

- Copy the URL of this repo: https://github.com/ZeusLGR/news-api-be-project.git

- Open your command line and create a new directory for where you wish to hold your repo clone.

- Use the _'git clone'_ command followed by the the URL to clone this repo into your directory.



## Connect to databases locally:

>### If you wish to run this repo locally you must create the necessary environment variables.

- To do this you will need to create two .env files: `.env.test` and `.env.development`.

- In the `.env.development` file, add: _`PGDATABASE=nc_news`_ 

- In the `.env.test` file, add: _`PGDATABASE=nc_news_test`_



## Install dependencies:

You will need to use the _'npm install'_ command at this point to install the dependencies in the `package.json` file.



## Seed local database:

You can use the scripts in the `package.json` file to do this. 

- _'run setup-dbs'_ which will  run the `setup.sql` file and create the database, followed by 

- _'run seed'_ which will create all tables and insert relevant data.



## Running tests:

You can run tests using the following command: _'npm t'_ 

This will run all tests located in the `app.test.js` file 

