export const SERVER_URL =
  process.env.INTERNAL_SERVER_URL ||
  (process.env.NEXT_BUILD
    ? `http://127.0.0.1:${process.env.PORT || 3000}`
    : process.env.NEXT_PUBLIC_SERVER_URL)

export const GRAPHQL_API_URL = SERVER_URL
