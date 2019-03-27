# ontology-editor

## Local Dev Setup

### 1. Get OAuth Credentials

1. Create an OAuth app: <https://github.com/settings/applications/new>
1. Homepage / Callback : `http://localhost:3000/`

(Keep these values, you can always reuse them locally. Stash the env file if need be.)

### 2. Get a Personal Access Token

1. Generate a token: <https://github.com/settings/tokens/new>

(Keep this value, you can always reuse them locally. Stash the env file if need be.)

### 3. Fill in Env Vars

1. Replace the values in [`./docker-app-dev/.env`](./docker-app-dev/.env)

```
# customer namespace
## this should be a slug, so no space, no special characters etc
CUSTOMER_NAME=zazuko

# postgres config
## root password, used to run migrations, create customer DB, etc
## this var is also used by the postgres container
POSTGRESQL_PASSWORD=make-this-secret
## database host
POSTGRESQL_HOST=localhost
## the editor API doesn't access postgres as root, it uses a role that
## gets created with the following password
POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD=password-used-by-postgraphile-to-access-pg

# secret seed for JWT - https://www.graphile.org/postgraphile/security/
POSTGRAPHILE_TOKEN_SECRET=this-is-secret-as-well

OAUTH_HOST=https://github.com/login/oauth
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
GITHUB_PERSONAL_ACCESS_TOKEN=

# optional variables
DEBUG=editor:*
# SENTRY_DSN=
```

### 4. Run the Dev Server

1. `npm install`
1. Run the project:
  * Database:
      * `make up` (If the database is booting up for the first time, you'll see migrations being retried until DB is up and they get applied.)
  * Dev server + watch: `npm run dev`

Whenever you feel like it:

* Deleting the DB to start over:
    * `make reset`

## Deployment

Run an editor container with the above env variables.

### Local Deployment

Do this when you want to test the app locally under production settings, especially useful to test the initial setup / editor installation process.

1. Create an OAuth app: <https://github.com/settings/applications/new> using Homepage / Callback : `http://localhost:8000/`
    * only do this once and keep the `Client ID` and `Client Secret`, reusing these values works well.
1. Shut down the database and delete its content:
    * `make reset`
1. Build the local image:
    * `docker-compose build`
1. Start the local containers: (alternative: `make localup`)
    * `docker-compose up -d`
    * `docker-compose logs -f app nginx`
1. Go to <http://localhost:8000> (simple) or better yet: set `testdomain.com` to `127.0.0.1` in your hosts file and go to <http://testdomain.com:8000>

### Prod Deployment

TODO: explain how to build a prod image (basically `.gitlab-ci.yml`)

Two containers: Postgres (probably already running to host other customers' editors) and the editor container.

The editor container needs the following env vars:

```
# customer name is a slug, schema-alod-ch, zazuko, dcf-org, …
CUSTOMER_NAME=zazuko
# This password needs to match the one set on the postgres container
POSTGRESQL_PASSWORD=make-this-secret
# `containername` if postgres is linked with the name `containername`
POSTGRESQL_HOST=db
# a secret password used by the editor's postgres roles
POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD=password-used-by-postgraphile-to-access-pg
# a token used as hash/salt, keep it secret for JWT security
POSTGRAPHILE_TOKEN_SECRET=this-is-secret-as-well
```

That's it. The remaining configuration is done using the installer (navigate to the container once it's up).

## E2E tests

1. `npm run e2e`
1. `npm run e2e:open`

## Architecture

### 2 Services

1. A Postgres Database
1. A web backend made of:
    * A Nuxt app, using Apollo as GraphQL client
    * A Nuxt Server Middleware that is trifid-core
    * A Nuxt Server Middleware implemented as an Express API
        * This is where the forge-specific functionality (GitHub, GitLab, …) is implemented
        * Configurable via `nuxt.config.js`
    * A GraphQL API backed by Postgres, schema generated by introspecting the pg schema

## Concepts and Implementation Overview

### Trifid

### Proposals

* `thread.headline`: the PR title and proposal title used in proposals lists
    * Sample value: `Change property 'wheelCount'`
* `thread.iri`: the IRI of the object from which the proposal originated
    * Sample value: `http://example.com/schema/wheelCount`
* `thread.body`: the motivation for this proposal
    * Sample value: `wheelCount currently has no type although it should be an integer`
* `thread.thread_type`:
    * Value: `proposal`
* `thread.status`: a new proposal is always `open`, admins can then set it to one of: `resolved`, `rejected`, `hidden`
    * Sample value: `open`
* `thread.is_draft`: `TRUE` until the proposal author submits their proposal
    * Sample value: `FALSE`
* `thread.proposal_object`: the actual proposal content in a serialized format, cf. [`proposalSerializer`](https://github.com/zazuko/ontology-editor/blob/869314787d1b618665615d9131448a5662562f65/plugins/libs/proposals.js#L114-L116) and [`proposalDeserializer`](https://github.com/zazuko/ontology-editor/blob/869314787d1b618665615d9131448a5662562f65/plugins/libs/proposals.js#L118-L125)
* `thread.branch_name`:
    * Sample value: `2019-03-12T140521.151Z`

Proposals are handled by one of these two store modules depending on their type:

* [`store/class.js`](./store/class.js)
* [`store/prop.js`](./store/prop.js)

These store modules are responsible for loading a proposal from the DB, saving a proposal to the DB, etc.

### Threads

* A thread can either be a `discussion` or a `proposal`.
* A thread with `discussion` type is a conversation, messages belong to a thread.

### PR

* A PR is a Pull Request or Merge Request.
* A PR is created by a system account hitting the Forge API.
* Creating a PR is roughly:
    1. Create a branch based on `master`, give it a unique name.
    1. Apply the proposed changes to the files on this branch.
    1. Create a commit attributed to the original author, push the branch to the origin.
    1. Open a PR targeting `master`, retrieve the PR `id` and branch name, store them as `thread.external_id` `thread.branch_name`.

## Resources

- https://github.com/Akryum/vue-apollo/blob/master/tests/demo/src/components/ChannelView.vue
- https://github.com/Akryum/vue-apollo/tree/master/tests/demo/src/graphql


## Helpful Tools

- Vue devtools extension [Chrome, Firefox](https://github.com/vuejs/vue-devtools#installation)
- Local GraphQL IDE: [Graph*i*QL `http://localhost:3000/graphiql`](http://localhost:3000/graphiql)
- A postgres client (e.g. [Postico](https://eggerapps.at/postico/) for MacOS) to inspect schemas and data
- Apollo devtools extension [Chrome, Firefox](https://github.com/apollographql/apollo-client-devtools#apollo-client-devtools)

## FAQ

### How to wipe a customer DB?

For customer `example_com`:
```sql
drop database example_com_db;
drop role example_com_role_postgraphile;
drop role example_com_role_anonymous;
drop role example_com_role_person;
```

## References

* GraphQL: https://graphql.org/learn/
* Postgraphile: https://www.graphile.org/postgraphile/introduction/
* Nuxt: https://nuxtjs.org/guide/installation
    * Apollo: https://github.com/nuxt-community/apollo-module
    * Auth: https://auth.nuxtjs.org/
