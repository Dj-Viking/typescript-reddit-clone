require('dotenv').config();
import 'reflect-metadata';
import { Post } from './entities/Post';
import { User } from './entities/User';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from 'src/types';
import cors from 'cors';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME } from './constants';
import { sendEmail } from './utils/sendEmail';
import { createConnection } from 'typeorm';

async function main(){
  sendEmail(process.env.NODEMAILER_EMAIL_TO as string, "sup");
  //connect to database
  const connection = await createConnection({
    type: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: true, //synchronize usually true during dev
    entities: [Post, User]
  });

  //create express app
  const app = express();
  
  const RedisStore = connectRedis(session);
  const RedisClient = new Redis();
  //set cors middleware for express
  app.use(
    //can apply cors to a particular route
    // '/'
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );
  //create redis client for session cookie
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
        client: RedisClient, 
        disableTouch: false,
        host: 'localhost',
        port: 6739,
        ttl: 86400
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,// 10 years
        httpOnly: true, //if true cookie works in http
        sameSite: 'lax', //protecting csrf
        //secure: process.env.NODE_ENV === 'production' // cookie only works in https
        secure: false
      },
      secret: `${process.env.SECRET}`,
      resave: false,
      saveUninitialized: false 
    })
  );
  //create apollo server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): MyContext => ({ req, res, RedisClient })
  });

  apolloServer.applyMiddleware({ 
    app, 
    cors: false
  });
  
  app.use('/', (_, res) => {
    res.status(200).send('hello');
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('\x1b[33m', `server started on localhost:${PORT}`, '\x1b[00m');
  });

};

main().catch(e => console.log(e));
console.log('hello world');

/** graph ql settings
 * {
  "editor.cursorShape": "line",
  "editor.fontFamily": "'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
  "editor.fontSize": 14,
  "editor.reuseHeaders": true,
  "editor.theme": "dark",
  "general.betaUpdates": false,
  "prettier.printWidth": 80,
  "prettier.tabWidth": 2,
  "prettier.useTabs": false,
  "request.credentials": "include", *****super important will not set cookies in browser if set to "omit" !!!!
  "schema.disableComments": true,
  "schema.polling.enable": true,
  "schema.polling.endpointFilter": "*localhost*",
  "schema.polling.interval": 2000,
  "tracing.hideTracingResponse": true,
  "queryPlan.hideQueryPlanResponse": true
}
 */