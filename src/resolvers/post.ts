import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';
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
        post(id: $id){
          id
          title
          createdAt
          updatedAt
        }
      }
      {
        post(id: 1) {
          id
          title
          createdAt
          updatedAt
        }
      }

   */
  @Query(() => Post, { nullable: true })
  post(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }
}