import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from '../types';

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
        }
      }
      {
        post(identifier: 1) {
          id
          title
          createdAt
          updatedAt
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
        }
      }
      createPost(
        title: "example title arg"
      ){
        id
        createdAt
        updatedAt
        title
      }
   */
  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
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
}