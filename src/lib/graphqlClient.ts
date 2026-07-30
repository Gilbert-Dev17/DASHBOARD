import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "/api/graphql";

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {},
});

export async function gqlRequest<T = unknown>(query: string, variables?: Record<string, unknown>) {
  return graphqlClient.request<T>(query, variables);
}

export default graphqlClient;
