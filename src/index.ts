import { MikroORM } from '@mikro-orm/core';
import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config';

async function main(){
  //connect to database
  const orm = await MikroORM.init(mikroConfig);
  //console.log(orm);
  await orm.getMigrator().up();
  const post = orm.em.create(Post, {
    title: 'my first post'
  });
  //em is entity manager
  await orm.em.persistAndFlush(post);

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
}

main().catch(e => console.log(e));
console.log('hello world');