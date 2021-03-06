import { MyContext } from '../types';
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
import { COOKIE_NAME, FORGET_PASS_PREFIX } from '../constants';
import { sendEmail } from '../utils/sendEmail';
const uuid = require('uuid');

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
    @Ctx() { em, RedisClient } : MyContext
  ){
    try {
      const user = await em.findOne(User, {email});
      if (!user) {
        //email not in db
        // dont send the email
        return true;
      }
      //if we actually matched a user 
      // the mutation will take some time
      // to execute
      const token = uuid.v4();
  
      //set the token with ioredis
      const thing = await RedisClient.set(
        FORGET_PASS_PREFIX + token, //key
        user.id, //value type
        'ex', 
        1000 * 60 * 60 * 24 //token expires after 1 day
      );

      console.log(thing);
  
      await sendEmail(email,
        `<a href="http://localhost:3000/change-password/${token}">Reset your password</a>`
      );
      return true;
    } catch (error) {
      console.log(error);
      return true;
    }
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { em, RedisClient, req }: MyContext
  ): Promise<UserResponse>{

    try {
      
      if (newPassword.length <= 3) 
      {
        return {
          errors: [
            {
              field: "newPassword",
              message: "New password length too short must be greater than 3 characters"
            },
          ],
        };
      }
  
      const key = FORGET_PASS_PREFIX + token;
      const userId = await RedisClient.get(key)
      console.log('user ID returned from REDIS CLIENT!!!', Promise.resolve(userId));
      if (!userId) 
      {
        return {
          errors: [
            {
              field: "token",
              message: "token expired"
            },
          ],
        };
      }
  
      const user = await em.findOne
      (
        User,
        {
          id: parseInt(userId)
        }
      );

      if (!user) 
      {
        return {
          errors: [
            {
              field: "token",
              message: "token expired"
            },
          ],
        };
      }
  
      user.password = await argon2.hash(newPassword);
      await em.persistAndFlush(user);

      //delete the key so we can't change
      // the password again because the token
      // will be forcibly expired
      await RedisClient.del(key)

      //log in user after password change
      req.session.userId = user.id;

      return {
        user
      }
    } catch (error) {
      console.log(error);
      return {
        errors: [
          {
            field: "error",
            message: error
          },
        ],
      };
    }
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