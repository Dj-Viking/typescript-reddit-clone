import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import React from 'react';
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';

import theme from '../theme';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';

function MyApp({ Component, pageProps }: any) {

  //using this to properly cast types
  function betterUpdateQuery<Result, Query>(
    cache: Cache,
    queryInput: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
  ){
    return cache.updateQuery(queryInput, (data) => fn(result, data as any) as any);
  }

  const client = createClient({
    url: "http://localhost:4000/graphql",
    //credentials for sending the cookie
    fetchOptions: {
      //but need to change the cors header on the server to the address
      // of the client
      credentials: "include"
    },
    exchanges: [ dedupExchange, cacheExchange({
      //runs whenever these mutations run and updates the urql cache
      updates: {
        Mutation: 
        {
          login: function (_result, _args, cache, _info) {
            betterUpdateQuery<LoginMutation, MeQuery>
            (
              cache,
              { query: MeDocument },
              _result,
              function (result, query){
                if (result.login.errors) return query; 
                else return { me: result.login.user }
              }
            );
          },
          register: function (_result, _args, cache, _info) {
            betterUpdateQuery<RegisterMutation, MeQuery>
            (
              cache,
              { query: MeDocument },
              _result,
              function (result, query){
                if (result.register.errors) return query; 
                else return { me: result.register.user }
              }
            );
          },
        },
      },
    }), 
    fetchExchange 
  ]
  });

  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  )
};

export default MyApp;
