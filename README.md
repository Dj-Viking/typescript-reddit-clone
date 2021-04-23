## Getting Started
1. clone repo
```sh 
  git clone git@github.com:Dj-Viking/fullstack-typescript-mern.git
```
2. install dependencies
```sh
  cd server; npm install; cd ..; cd client; npm install
```
3. Must have installed redis for the user auth session cookies
  - if user has mac or linux can use homebrew to install redis
```sh
  https://phoenixnap.com/kb/install-redis-on-mac
```
4. Must have postgresql installed for database access from the
node application
  - 
  ```sh 
  sudo -u postgres psql template1
  ```
  - once signed in use this command to set a password for the postgres user to access the db ```ALTER USER postgres PASSWORD '<new password>';``` and use that password for the DB_PASSWORD
  - must create a database name to input for the next step which requires logging into the postgresql shell and manually creating the database ```CREATE DATABASE <name>;``` semicolon is important for the database query!!
  - and then set a new password for the postgres user
5. must set ENV variables for
  - DB_NAME, 
  - DB_PASSWORD, 
  - DB_USER, 
  - SECRET,
  - NODEMAILER_AUTH_EMAIL, (can use the generated email in the console output for testing once nodemailer is able to execute)
  - NODEMAILER_AUTH_PASS (same as above)
  - NODEMAILER_EMAIL_TO - define some valid email for testing purposes. the email actually doesn't get sent out to this address, it just spits a link into the server node console with the link to go reset an account's password. its not using an actual email client


6. once everything is installed and configured
  - have a few terminal windows open and run each command in a separate window to fully run the fullstack app
    * start a local redis server for session cookies
    ```sh
      redis-server
    ```
    * start the typescript compiler
    ```sh
      cd server; npm run watch;
    ```
    * start the nodemon server that runs the compiled typscript 
    out of the /dist folder and connects to the postgresql database on the local db configurations set in the .env file
    ```sh
      cd server; npm run dev
    ```
    * start the client
    ```sh
      cd client; npm run dev
    ```