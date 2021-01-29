import { Post } from './entities/Post';
import { User } from './entities/User';
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
require('dotenv').config();

//to make another migration run this command in the shell
//npx mikro-orm migration:create

const mikroConfig = {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w]+\d+\.[tj]s$/
  },
  entities: [Post, User],
  dbName: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  type: process.env.DB_TYPE,
  debug: process.env.NODE_ENV !== 'production' //return true if running not in production
} as Parameters<typeof MikroORM.init>[0];
//exporting an object which is the type of the first expected parameter of the method MikroORM.init()

export default mikroConfig;