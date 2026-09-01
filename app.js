const SHOPIFY_CLIENT_ID =
  "2619e33e3542c2a2e7e1431c6ac7edaf";

const SHOPIFY_AUTHORIZATION_ENDPOINT =
  "https://shopify.com/authentication/75827249230/oauth/authorize";

const REDIRECT_URI =
  "https://github.yourcookie.site/auth/callback.html";

const loginButton =
  document.getElementById("shopify-login");

const status =
  document.getElementById("status");


function randomString(length = 64) {
  const array = new Uint8Array(length);

  crypto.getRandomValues(array);

  return Array.from(array)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}


async function createCodeChallenge(codeVerifier) {
  const data =
    new TextEncoder().encode(codeVerifier);

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  const bytes =
    new Uint8Array(digest);

  let binary = "";

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}


async function loginWithShopify() {

  try {

    status.textContent =
      "Redirecting to Shopify...";


    // Generate OAuth state
    const state =
      randomString(32);

    // Generate OIDC nonce
    const nonce =
      randomString(32);

    // Generate PKCE verifier
    const codeVerifier =
      randomString(64);

    // Generate PKCE challenge
    const codeChallenge =
      await createCodeChallenge(
        codeVerifier
      );


    /*
     * Store these values because we need them
     * when Shopify redirects back to callback.html.
     */
    sessionStorage.setItem(
      "shopify_state",
      state
    );

    sessionStorage.setItem(
      "shopify_nonce",
      nonce
    );

    sessionStorage.setItem(
      "shopify_code_verifier",
      codeVerifier
    );


    /*
     * Build Shopify authorization URL.
     */
    const authorizationUrl =
      new URL(
        SHOPIFY_AUTHORIZATION_ENDPOINT
      );


    authorizationUrl.searchParams.set(
      "client_id",
      SHOPIFY_CLIENT_ID
    );

    authorizationUrl.searchParams.set(
      "response_type",
      "code"
    );

    authorizationUrl.searchParams.set(
      "redirect_uri",
      REDIRECT_URI
    );

    authorizationUrl.searchParams.set(
      "scope",
      "openid email customer-account-api:full"
    );

    authorizationUrl.searchParams.set(
      "state",
      state
    );

    authorizationUrl.searchParams.set(
      "nonce",
      nonce
    );

    authorizationUrl.searchParams.set(
      "code_challenge",
      codeChallenge
    );

    authorizationUrl.searchParams.set(
      "code_challenge_method",
      "S256"
    );


    /*
     * Top-level browser navigation.
     *
     * IMPORTANT:
     * We are NOT using fetch().
     * Therefore the previous CORS problem
     * is completely avoided.
     */
    window.location.href =
      authorizationUrl.toString();

  } catch (error) {

    console.error(
      "Shopify login failed:",
      error
    );

    status.textContent =
      "Unable to start Shopify login.";

  }

}


loginButton.addEventListener(
  "click",
  loginWithShopify
);