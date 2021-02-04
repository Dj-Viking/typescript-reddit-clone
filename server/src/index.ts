require('dotenv').config();
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
//import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from 'src/types';
import cors from 'cors';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

async function main(){
  //connect to database
  const orm = await MikroORM.init(mikroConfig);
  //console.log(orm);
  await orm.getMigrator().up();
  // const post = orm.em.create(Post, {
  //   title: 'my first post'
  // });
  // //em is entity manager
  // await orm.em.persistAndFlush(post);

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);

  //create express app
  const app = express();
  
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

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
      name: 'sid',
      store: new RedisStore({ 
        client: redisClient, 
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
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  });

  apolloServer.applyMiddleware(
    { 
      app, 
      cors: false
    }
  );
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