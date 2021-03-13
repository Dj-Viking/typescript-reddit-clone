import React, { useEffect } from 'react';
import NavBar from '../components/navbar';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import moment from 'moment';

const Index = () => {

  useEffect(() => {
    document.title = "Home"
  }, []);

  const [{data}] = usePostsQuery();

  function formatDate(date: number){
    //the parsed date coming from the database
    // is a string but the number itself is the parsed date...weird
    const dateObj = new Date(date);
    return moment(dateObj).format('MM/DD/YYYY hh:mm:ss a');
  }

  return (
    <>
      <NavBar/>
      <div>
        hello world
      </div>
      {
        !data ? <div>Loading...</div>
        : 
        data.posts.map(post => {
          return (
            <div
              style={{marginTop: '10px'}}
              key={post.id}
            >
              <p 
                style={{fontWeight: 'bold'}}
              >
                Title: 
                <span 
                  style={{marginLeft: '10px', fontWeight: 'normal'}}
                >
                  {post.title}
                </span>
              </p>
              <p 
                style={{color: 'black', fontWeight: 'bold'}}
              >
                Created By: 
                <span 
                  style={{margin: '0 10px', color: 'black', fontWeight: 'normal'}}
                >
                  {"not yet configured"}
                </span> 
                @ 
                <span 
                  style={{marginLeft: '10px', fontWeight: 'normal'}}
                >
                  {formatDate(Number(post.createdAt))}
                </span>
              </p>
            </div>
          )
        })
      }
    </>
  );
}

//server side rendering to help with SEO for certain pages that need to be found easily by google
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

// export default withUrqlClient(
//   (ssrExchange) => ({
//     url: "http://localhost:4000/graphql" || process.env.API_ENDPOINT as string,
//     fetchOptions: {
//       credentials: 'include' as const
//     },
//     exchanges: [
//       dedupExchange,
//       cacheExchange({
//         //runs whenever these mutations run and updates the urql cache
//         updates: 
//         {
//           Mutation: 
//           {
//             login: function (_result, _args, cache, _info) {
//               betterUpdateQuery<LoginMutation, MeQuery>
//               (
//                 cache,
//                 { query: MeDocument },
//                 _result,
//                 function (result, query){
//                   if (result.login.errors) return query; 
//                   else return { me: result.login.user }
//                 }
//               );
//             },
//             register: function (_result, _args, cache, _info) {
//               betterUpdateQuery<RegisterMutation, MeQuery>
//               (
//                 cache,
//                 { query: MeDocument },
//                 _result,
//                 function (result, query){
//                   if (result.register.errors) return query; 
//                   else return { me: result.register.user }
//                 }
//               );
//             },
//             logout: function(_result, _args, cache, _info) {
//               // return null from the me query
//               betterUpdateQuery<LogoutMutation, MeQuery>(
//                 cache,
//                 { query: MeDocument },
//                 _result,
//                 () => ({ me: null })
//               );
//             },
//           },
//         },
//       }),
//       ssrExchange,
//       fetchExchange
//     ]
//   }),
// )(Index);



