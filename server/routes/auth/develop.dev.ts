import type { H3Event } from "h3";
import { eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { snakeCase, upperFirst } from "scule";
import { FetchError } from "ofetch";

import { createError } from "#imports";
import type { OAuthConfig, OAuthProvider, OnError } from "#auth-utils";

interface OAuthDevelopConfig {
  clientId?: string;
  clientSecret?: string;
  domain?: string;
  redirectURL?: string;
  scope?: string[];
}

function defineOAuthDevelopEventHandler({
  config,
  onSuccess,
  onError,
}: OAuthConfig<OAuthDevelopConfig>) {
  return eventHandler(async (event: H3Event) => {
    config = defu(config, {
      clientId: "shuttr_dev",
      clientSecret: "ZXhhbXBsZS1hcHAtc2VjcmV0",
      domain: "localhost:5556",
      redirectURL: "http://localhost:3000/auth/develop",
      scope: ["openid", "profile", "email", "groups"],
    }) as OAuthDevelopConfig;

    const query = getQuery<{ code?: string; error?: string }>(event);

    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Develop login failed: ${query.error || "Unknown error"}`,
        data: query,
      });
      if (!onError) throw error;
      return onError(event, error);
    }

    if (
      !config.clientId ||
      !config.clientSecret ||
      !config.domain ||
      !config.redirectURL
    ) {
      return handleMissingConfiguration(
        event,
        "develop",
        ["clientId", "clientSecret", "domain"],
        onError
      );
    }

    const authorizationURL = `http://${config.domain}/dex/auth`;
    const tokenURL = `http://${config.domain}/dex/token`;

    if (!query.code) {
      // Redirect to Development OAuth page

      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: config.redirectURL,
          scope: (
            config.scope || ["openid", "profile", "email", "groups"]
          ).join(" "),
        })
      );
    }

    const tokens = await requestAccessToken(tokenURL, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.clientId}:${config.clientSecret}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        redirect_uri: config.redirectURL,
        code: query.code,
      },
    });

    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "develop", tokens, onError);
    }

    const accessToken = tokens.access_token;
    // Fetch user info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = await $fetch(`http://${config.domain}/dex/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get development user",
        data: tokens,
      });
      if (!onError) throw error;
      return onError(event, error);
    }

    return onSuccess(event, {
      user,
      tokens,
    });
  });
}

interface RequestAccessTokenBody {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret?: string;
  [key: string]: string | undefined;
}

interface RequestAccessTokenOptions {
  body?: RequestAccessTokenBody;
  params?: Record<string, string | undefined>;
  headers?: Record<string, string>;
}

function handleMissingConfiguration(
  event: H3Event,
  provider: OAuthProvider,
  missingKeys: string[],
  onError?: OnError
) {
  const environmentVariables = missingKeys.map(
    (key) =>
      `NUXT_OAUTH_${provider.toUpperCase()}_${snakeCase(key).toUpperCase()}`
  );

  const error = createError({
    statusCode: 500,
    message: `Missing ${environmentVariables.join(" or ")} env ${
      missingKeys.length > 1 ? "variables" : "variable"
    }.`,
  });

  if (!onError) throw error;
  return onError(event, error);
}

function handleAccessTokenErrorResponse(
  event: H3Event,
  oauthProvider: OAuthProvider,
  oauthError: any,
  onError?: OnError
) {
  const message = `${upperFirst(oauthProvider)} login failed: ${
    oauthError.error_description || oauthError.error || "Unknown error"
  }`;

  const error = createError({
    statusCode: 401,
    message,
    data: oauthError,
  });

  if (!onError) throw error;
  return onError(event, error);
}

async function requestAccessToken(
  url: string,
  options: RequestAccessTokenOptions
): Promise<any> {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers,
  };

  // Encode the body as a URLSearchParams if the content type is 'application/x-www-form-urlencoded'.
  const body =
    headers["Content-Type"] === "application/x-www-form-urlencoded"
      ? new URLSearchParams(
          (options.body as unknown as Record<string, string>) ||
            options.params ||
            {}
        ).toString()
      : options.body;

  return $fetch(url, {
    method: "POST",
    headers,
    body,
  }).catch((error) => {
    /**
     * For a better error handling, only unauthorized errors are intercepted, and other errors are re-thrown.
     */
    if (error instanceof FetchError && error.status === 401) {
      return error.data;
    }
    throw error;
  });
}

// A Dex instance is used to provide a local oidc provider.
// This should just work instantly, and is automatically disabled when building for release.
export default defineOAuthDevelopEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      loggedInAt: new Date(),
      user: {
        email: user.email,
        name: user.name,
      },
      secure: {
        provider: "develop",
        providerId: user.sub,
      },
    });
    return sendRedirect(event, "/");
  },
});
