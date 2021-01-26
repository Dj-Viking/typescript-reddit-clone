import { MyContext } from 'src/types';
import { User } from '../entities/User';
import { Field, InputType, Resolver, Arg, Mutation, Ctx } from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@Resolver()
export class UserResolver {

  /**
   *  @example
    mutation {
        register(options: {
          username: "viking",
          password: "viking"
        }){
          username
          id
        }
    }
   */
  @Mutation(() => User)
  async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) {
    try {
      const hashedPassword = await argon2.hash(options.password);
      const user = em.create
      (
        User, 
        { 
          username: options.username, 
          password: hashedPassword 
        }
      );
      await em.persistAndFlush(user);
      return user;
    } catch (error) {
      return console.log(error);
    }
  }

}