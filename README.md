# ontology-editor

## Dev Setup

* Run the project
    1. `make up`
    2. `npm run dev-api`
* Delete the DB to start over
    * `make reset`
* GraphQL IDE: [Graph*i*QL `http://localhost:5000/graphiql`](http://localhost:5000/graphiql)

## GitHub Setup

1. Create an OAuth app: https://github.com/settings/applications/new
1. Homepage / Callback : `http://localhost:3000/`
1. Fill the env vars in `.env`:
    ```
    OAUTH_CLIENT_ID=6bac5524e0e11f1ae9ec
    OAUTH_CLIENT_SECRET=b5d15ea361b1d28a44152599c72621a36c631751
    ```

## Architecture

* A GraphQL API backed by Postgres, generated by introspecting the pg schema.
* A Nuxt app, using Apollo as GraphQL client.
* A Server Middleware implemented as an Express API
  * This is where the forge-specific functionality (GitHub, GitLab, …) is implemented
  * Configurable via `nuxt.config.js`

### To Consider

* Should the forge-specific functionalities implemented as a GraphQL endpoint?
  * How does Apollo support multiple endpoints?
  * https://www.prisma.io/blog/how-to-wrap-a-rest-api-with-graphql-8bf3fb17547d/
  * https://medium.com/@sastraxi/authenticated-and-stitched-schemas-with-postgraphile-passport-and-stripe-a51490a858a2
  * https://www.apollographql.com/docs/graphql-tools/schema-stitching.html

## References

* GraphQL: https://graphql.org/learn/
* Postgraphile: https://www.graphile.org/postgraphile/introduction/
* Nuxt: https://nuxtjs.org/guide/installation
    * Apollo: https://github.com/nuxt-community/apollo-module
    * Auth: https://auth.nuxtjs.org/
