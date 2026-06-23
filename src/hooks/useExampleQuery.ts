import { useQuery } from "@tanstack/react-query";
import { gqlRequest } from "../lib/graphqlClient";

type ExampleData = {
  hello?: string;
};

export function useExampleQuery() {
  return useQuery<ExampleData>(["example"], async () => {
    const query = `query Example { hello }`;
    const data = await gqlRequest<ExampleData>(query);
    return data;
  });
}
