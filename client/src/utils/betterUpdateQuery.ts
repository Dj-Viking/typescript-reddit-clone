import { QueryInput } from "@urql/exchange-graphcache";
import { Cache } from '@urql/exchange-graphcache';

//using this to properly cast types
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
){
  return cache.updateQuery(queryInput, (data) => fn(result, data as any) as any);
}