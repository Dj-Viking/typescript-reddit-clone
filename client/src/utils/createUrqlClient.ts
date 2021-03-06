import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import { LoginMutation, MeQuery, MeDocument, RegisterMutation, LogoutMutation } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { NextUrqlPageContext } from "next-urql";


export const createUrqlClient = (_ssrExchange: any, ctx?: NextUrqlPageContext ) => ({
  url: "http://localhost:4000/graphql" || process.env.API_ENDPOINT as string,
  fetchOptions: {
    credentials: 'include' as const,
    headers: {
      Authorization: `Bearer ${ ctx?.req?.headers?.authorization ?? '' }` as string
    }
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      //runs whenever these mutations run and updates the urql cache
      updates: 
      {
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
          logout: function(_result, _args, cache, _info) {
            // return null from the me query
            betterUpdateQuery<LogoutMutation, MeQuery>
            (
              cache,
              { query: MeDocument },
              _result,
              function (){ return { me: null } }
            );
          },
        },
      },
    }),
    _ssrExchange,
    fetchExchange
  ]
});