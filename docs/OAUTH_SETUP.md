# OAuth / OIDC Setup

This app supports OAuth/OIDC login via better-auth's [generic OAuth plugin](https://www.better-auth.com/docs/plugins/generic-oauth). Any OpenID Connect provider (Authentik, Keycloak, Auth0, etc.) can be configured through the admin UI — no code changes required.

## Prerequisites

- An admin account on your instance
- An OIDC provider with a discovery endpoint (`.well-known/openid-configuration`)

## 1. Create an OAuth2/OIDC Provider

In your identity provider, create a new OAuth2/OIDC application:

- **Client type**: Confidential
- **Grant type**: Authorization Code
- **Redirect URI**: `https://<your-domain>/api/auth/oauth2/callback/<provider-id>`
  - `<provider-id>` is the ID you'll use in step 2 (e.g., `authentik`, `keycloak`)
- **Scopes**: `openid`, `profile`, `email`

Note the **Client ID**, **Client Secret**, and **Discovery URL**.

## 2. Configure in the App

1. Log in as an admin and go to **Settings** (`/admin/settings`)
2. Click **Add Provider** and fill in:
   - **Provider ID**: A short alphanumeric identifier (e.g., `authentik`) — this must match the `<provider-id>` used in the redirect URI above
   - **Discovery URL**: Your provider's OIDC discovery endpoint
   - **Client ID**: From step 1
   - **Client Secret**: From step 1
   - **Scopes**: `openid, profile, email` (default)
   - **PKCE**: Enabled (recommended)
3. Click **Save OIDC Settings**
4. **Restart the application** — OIDC config is loaded at startup

After restart, the login page will display an OAuth button for each configured provider.

## Account Linking

If a user signs up with email/password and later logs in via OAuth using the same email, the accounts are automatically linked when the provider is listed in `trustedProviders` in `api/src/auth.ts`:

```ts
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["<provider-id>"],
  },
},
```

Without this, users with existing email/password accounts will see an `account_not_linked` error when attempting OAuth login.

## Deployment Notes

When deploying with the Helm chart, `BETTER_AUTH_BASE_URL` is automatically derived from the ingress host. The app serves both the UI and API on the same origin, so no `VITE_API_URL` or CORS configuration is needed.

If port-forwarding for local testing, be aware that `BETTER_AUTH_BASE_URL` must match the URL in your browser (e.g., `http://localhost:3000`), or auth requests will fail with an invalid origin error.

<details>
<summary><h2>Authentik-Specific Setup</h2></summary>

### Create the Provider

1. Go to **Admin** > **Applications** > **Providers** > **Create**
2. Select **OAuth2/OpenID Provider**
3. Configure:
   - **Name**: Your app name
   - **Client type**: Confidential
   - **Redirect URIs/Origins**: Set to **Strict** with value:
     ```
     https://<your-domain>/api/auth/oauth2/callback/authentik
     ```
   - **Signing Key**: `authentik Self-signed Certificate`
4. Note the **Client ID** and **Client Secret**

### Create the Application

1. Go to **Admin** > **Applications** > **Applications** > **Create**
2. Configure:
   - **Name**: Your app name
   - **Slug**: Your app slug (e.g., `my-app`)
   - **Provider**: Select the provider created above

### Discovery URL

The discovery URL for Authentik follows this pattern:

```
https://<authentik-domain>/application/o/<application-slug>/.well-known/openid-configuration
```

### Important Notes

- Do **not** use a Proxy Provider — that's for forward auth at the ingress level. Use an OAuth2/OpenID Provider for in-app login.
- Do **not** add the application to the embedded outpost — that's only needed for forward auth.
- If you previously had forward auth annotations on the ingress, remove them when switching to in-app OAuth to avoid conflicts.

</details>
