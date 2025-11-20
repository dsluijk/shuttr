# Shuttr

> [!WARNING]  
> Shuttr is under heavy development.
> Expect a lot of breaking changes, require manual intervention or complete resets.
> Due to this it is not ready for general users, but feel free to play around with it.
> Stay tuned for the initial release if you want to use it in production.

Shuttr is a simple to use open source photo gallery.
It's designed to be simple enough for anyone to use, yet be feature complete enough for amateur photographers to share there photo's with the world.

## Installation

The recommended way to install Shuttr is with Docker.
Configuration of the basics is done through environmental variables, with optional configuration done on the settings page.

### Requirements

Shuttr is sadly not completely standalone, and has some requirements to run.
In general this contains the following:

- Postgres (with PostGIS support)
- Either S3 or disk storage
- Compatible OAuth provider

The type of storage used (S3 or Disk) should be done in advance, as it is difficult to change this afterwards.

Currently only [Authentik](https://goauthentik.io/) and [Keycloak](https://keycloak.org/) are supported as OAuth supported, but generic OIDC provider support is planned.

### Configuration

Basic setup is done through environmental variables.

| **Variable**                            | **Default** | **Required** | **Description**                                                                                                |
| --------------------------------------- | ----------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `NUXT_SESSION_PASSWORD`                 | _None_      | YES          | Secret used to secure sessions. Should be at least 32 bytes and private.                                       |
| `DATABASE_HOST`                         | `localhost` | NO           | Host of the Postgres database.                                                                                 |
| `DATABASE_PORT`                         | `5432`      | NO           | Port of the Postgres database.                                                                                 |
| `DATABASE_USER`                         | _None_      | NO           | User of the Postgres database.                                                                                 |
| `DATABASE_PASSWORD`                     | _None_      | NO           | Password of the Postgres database.                                                                             |
| `DATABASE_DB`                           | `shuttr`    | NO           | Postgres database to use.                                                                                      |
| `DATABASE_SSL`                          | `false`     | NO           | Whenether to use SSL for the Postgres connection, set to `true` to use a secure connection.                    |
| `NUXT_OAUTH_AUTHENTIK_DISPLAY_NAME`     | `Authentik` | NO           | The displayname for the user of the Authentik server.                                                          |
| `NUXT_OAUTH_AUTHENTIK_DOMAIN`           | _None_      | NO           | The domain where the Authentik server is available.                                                            |
| `NUXT_OAUTH_AUTHENTIK_GROUPS_ADMIN`     | _None_      | NO           | The Authentik group to assign admin privileges to automatically when logging in.                               |
| `NUXT_OAUTH_AUTHENTIK_GROUPS_PUBLISHER` | _None_      | NO           | The Authentik group to assign publisher privileges to automatically when logging in.                           |
| `NUXT_OAUTH_AUTHENTIK_CLIENT_ID`        | _None_      | NO           | The client ID of the provider to use.                                                                          |
| `NUXT_OAUTH_AUTHENTIK_CLIENT_SECRET`    | _None_      | NO           | The client secret of the provider to use.                                                                      |
| `NUXT_OAUTH_KEYCLOAK_DISPLAY_NAME`      | `Keycloak`  | NO           | The displayname for the user of the Keycloak server.                                                           |
| `NUXT_OAUTH_KEYCLOAK_SERVER_URL`        | _None_      | NO           | The URL where the Keycloak server is available.                                                                |
| `NUXT_OAUTH_KEYCLOAK_GROUPS_ADMIN`      | _None_      | NO           | The Keycloak group to assign admin privileges to automatically when logging in.                                |
| `NUXT_OAUTH_KEYCLOAK_GROUPS_PUBLISHER`  | _None_      | NO           | The Keycloak group to assign publisher privileges to automatically when logging in.                            |
| `NUXT_OAUTH_KEYCLOAK_CLIENT_ID`         | _None_      | NO           | The client ID of the provider to use.                                                                          |
| `NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET`     | _None_      | NO           | The client secret of the provider to use.                                                                      |
| `NUXT_OAUTH_KEYCLOAK_REALM`             | _None_      | NO           | The keycloak realm to use.                                                                                     |
| `NUXT_STORAGE_TYPE`                     | _None_      | YES          | The storage type to use, either `s3` or `file`                                                                 |
| `NUXT_STORAGE_THUMB_CACHE_MAX`          | `1000`      | NO           | The maximum item size of the LRU cache for thumbnails. A higher limit uses more memory, but caches more images |
| `NUXT_STORAGE_FILE_BASE`                | _None_      | NO           | The base path to store images. Only applicable with store type `file`.                                         |
| `NUXT_STORAGE_S3_ACCESS_KEY`            | _None_      | NO           | The S3 bucket access key. Only applicable with storage type `s3`.                                              |
| `NUXT_STORAGE_S3_SECRET_KEY`            | _None_      | NO           | The S3 bucket secret key. Only applicable with storage type `s3`.                                              |
| `NUXT_STORAGE_S3_BUCKET`                | _None_      | NO           | The S3 bucket to use. Only applicable with storage type `s3`.                                                  |
| `NUXT_STORAGE_S3_ENDPOINT`              | _None_      | NO           | The endpoint of the S3 service. Only applicable with storage type `s3`.                                        |
| `NUXT_STORAGE_S3_REGION`                | _None_      | NO           | The S3 region to use. Only applicable with storage type `s3`.                                                  |
