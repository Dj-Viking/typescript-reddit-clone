import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from '../types';

@ObjectType()
class PostFieldError {
  @Field()
  field: String
  @Field()
  message: String
}
@ObjectType()
class PostResponse {
  @Field(() => [PostFieldError], { nullable: true })
  errors?: PostFieldError[]
  @Field(() => Post, { nullable: true })
  post?: Post | null
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
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
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
    @Arg('identifier', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
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
  @Mutation(() => PostResponse)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { req, em }: MyContext
  ): Promise<PostResponse> {
    let post;
    if (req.session) {
      console.log(req.session);
      post = em.create(
        Post,
        {
          title: title
        }
      );
      post.createdBy = req.session.username as string;
      console.log(post);
      if (post.createdBy) {
        await em.persistAndFlush(post);
      }
    }
    if (post?.createdBy) {
      return {
        post
      }
    } else {
      return {
        errors: [
          {
            field: 'Credentials',
            message: 'Must be logged in to do that!'
          }
        ],
      };
    }
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
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
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
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Post, { id });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}