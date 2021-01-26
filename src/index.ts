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

  //create apollo server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  });

  apolloServer.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('\x1b[33m', `server started on localhost:${PORT}`, '\x1b[00m');
  });

};

main().catch(e => console.log(e));
console.log('hello world');