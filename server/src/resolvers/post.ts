
//import { sleep } from 'src/utils/sleep';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from 'src/types';
import { 
  Arg, 
  Ctx, 
  Field, 
  InputType, 
  //Field, 
  Int, 
  Mutation, 
  //ObjectType, 
  Query, 
  Resolver, 
  UseMiddleware
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
// @ObjectType()
// class PostFieldError {
//   @Field()
//   field: String;
//   @Field()
//   message: String;
// }
// @ObjectType()
// class PostResponse {
//   @Field(() => [PostFieldError], { nullable: true })
//   errors?: PostFieldError[]
//   @Field(() => Post, { nullable: true })
//   post?: Post | null
// }

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@Resolver()
export class PostResolver {
  /**
   * 
   * @example
    {
      posts{
        id
        createdAt
        updatedAt
        title
      }
    }
   */
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }


  /**
   *  
   * @example 
   * //in graphql playground to create dynamic args
      query post($id: Int!){
        post(identifier: $id){
          id
          title
          createdAt
          updatedAt
          createdBy
        }
      }
      {
        post(identifier: 1) {
          id
          title
          createdAt
          updatedAt
          createdBy
        }
      }

   */
  @Query(() => Post, { nullable: true })
  post(
    @Arg('id', () => Int) id: number,
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }


  /**
   * @example 
      mutation(
        $title: String!
      ) {
        createPost(
          title: $title
        ) {
          id
          createdAt
          updatedAt
          title
          createdBy
        }
      }
      createPost(
        title: "example title arg"
      ){
        id
        createdAt
        updatedAt
        title
        createdBy
      }
   */
  @Mutation(() => Post)
  //creating auth middleware for the resolver
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | undefined> {
    let post;
      const result = await getConnection().createQueryBuilder().insert().into(Post).values(
        {
          ...input,
          creatorId: req.session.userId
        }
      )
      .returning('*')
      .execute();
      console.log('query builder result', result);
      //only returning the first user object in the array, 
      // i guess I could insert as many objects into the table and will
      // return more created objects into the raw array
      post = result.raw[0];
      return post;
  }

  /**
   * 
   * @example
      mutation(
        $title: String!,
        $id: Int!
      ) {
        updatePost(
          title: $title,
          id: $id
        ) {
          id
          createdAt
          updatedAt
          title
        }
      }
      updatePost(
        title: "example title arg",
        id: 12
      ){
        id
        createdAt
        updatedAt
        title
      }
   */
  @Mutation(() => Post)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({
      where: {
        id: id
      }
    });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await Post.update({ id }, { title })
    }
    return post;
  }

  /**
   * @example
      mutation deletePost($id: Int!) {
        deletePost(id: $id)
      }

      mutation{
        deletePost(id: 4)
      }
   */
  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    try {
      await Post.delete(id);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}