import { MyContext } from 'src/types';
import { User } from '../entities/User';
import { Field, InputType, Resolver, Arg, Mutation, Ctx, ObjectType } from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {

  @Field()
  field: String

  @Field()
  message: String

}

//user returned if worked
// or error returned if error was there
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
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


  /**
   * @example
    mutation{
        login(options: {
          username: "username",
          password: "password"
        }){
          errors{
            field
            message
          }
          user{
            id
            username
          }
        }
    }
   */
  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse | FieldError>{
    const user = await em.findOne(User, { username: options.username });
    if (!user) 
    {
      return {
        errors: [
          {
            field: 'credentials',
            message: 'incorrect credentials'
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid)
    {
      return {
        errors: [
          {
            field: "credentials",
            message: "Incorrect credentials"
          },
        ],
      };
    }
    return {
      user
    };
  }

}