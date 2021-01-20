import { MikroORM } from '@mikro-orm/core';
import { Post } from './entities/Post';


async function main(){
  const orm = await MikroORM.init({
    entities: [Post],
    dbName: 'fullstack_ts_db',
    password: 'root123@',
    type: 'postgresql',
    debug: process.env.NODE_ENV !== 'production' //return true if running not in production
  });
  //console.log(orm);

  const post = orm.em.create(Post, {
    title: 'my first post'
  });

  //em is entity manager
  await orm.em.persistAndFlush(post);
}

main().catch(e => console.log(e));
console.log('hello world');