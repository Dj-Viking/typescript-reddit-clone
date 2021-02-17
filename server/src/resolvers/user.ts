import { MyContext } from 'src/types';
import { User } from '../entities/User';
import { 
  Field, 
  InputType, 
  Resolver, 
  Arg, 
  Mutation, 
  Ctx, 
  ObjectType,
  Query 
} from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME } from '../constants';

@InputType()
class RegisterInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

@InputType()
class LoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

@ObjectType()
class UserFieldError {
  @Field()
  field: String;
  @Field()
  message: String; 
}

//user returned if worked
// or error returned if error was there
@ObjectType()
class UserResponse {
  @Field(() => [UserFieldError], { nullable: true })
  errors?: UserFieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em } : MyContext
  ){
    const user = await em.findOne(User, {email});
    console.log(user);
    return true;
  }

  @Query(() => User, { nullable: true})
  async me(
    @Ctx() { req, em }: MyContext
  ){
    // you are not logged in
    if (!req.session.userId) return null;

    const user = em.findOne(User, {id: req.session.userId});
    return user;
  }

  /**
   *  @example
    mutation 
    {
        register(options: {
          username: "viking",
          password: "viking"
        })
        {
          errors{
            field
            message
          }
          user{
            username
            id
            createdAt
            updatedAt
          }
        }
    }

    mutation register($options: UsernamePasswordInput!)
    {
        register(options: $options)
        {
          errors{
            field
            message
          }
          user{
            username
            id
            createdAt
            updatedAt
          }
        }
    }
   */
  @Mutation(() => UserResponse)
  async register(
    @Arg('options', () => RegisterInput) options: RegisterInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    try 
    {
      if (emailRegex.test(options.email) === false) 
      {
        return {
          errors: [
            {
              field: "Email",
              message: "Email is not in correct format. Must be like example@mail.com"
            }
          ]
        }
      }
      if (options.username.length <= 2) 
      {
        return {
          errors: [
            {
              field: "Username",
              message: "username length too short must be greater than 2 characters"
            },
          ],
        };
      }
      if (options.password.length <= 3) 
      {
        return {
          errors: [
            {
              field: "Password",
              message: "password length too short must be greater than 3 characters"
            },
          ],
        };
      }
  
      const hashedPassword = await argon2.hash(options.password);
      const user = em.create
      (
        User,
        {
          username: options.username,
          email: options.email,
          password: hashedPassword
        }
      );
      await em.persistAndFlush(user);

      //login the user after registration
      req.session.userId = user.id;
      req.session.username = user.username;
      return {
        user
      };
    } catch (error) {
      if (error.code === '23505' || error.detail.includes('already exists'))
      {
        return {
          errors: [
            {
              field: 'Username',
              message: "That username already exists!"
            },
          ],
        };
      } else {
        return {
          errors: [
            {
              field: 'Error',
              message: error
            }
          ],
        };
      }
    }
  }


  /**
   * @example
    mutation
    {
        login(options: {
          username: "username",
          password: "password"
        })
        {
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

    mutation login($options: UsernamePasswordInput)
    {
        login(options: $options)
        {
          errors{
            field
            message
          }
          user{
            id
            username
            createdAt
            updatedAt
          }
        }
    }
   */
  @Mutation(() => UserResponse)
  async login(
    @Arg('options', () => LoginInput) options: LoginInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse>{
    const user = await em.findOne(User, { email: options.email });
    if (!user) 
    {
      return {
        errors: [
          {
            field: 'Credentials',
            message: 'Incorrect Credentials'
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
            field: "Credentials",
            message: "Incorrect Credentials"
          },
        ],
      };
    }
    //login the user, and set the cookie
    req.session.userId = user.id;
    req.session.welcomeBackMsg = `Welcome back ${user.username}!`;
    req.session.username = user.username;
    console.log(req.session);

    return {
      user
    };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req, res}: MyContext
  ){
    return new Promise
    (
      resolve => req.session.destroy
      (
        error => {
          res.clearCookie(COOKIE_NAME);
          if (error) {
            console.log(error);
            resolve(false);
            return;
          } else {
            resolve(true);
          }
        }
      )
    );
  }

}