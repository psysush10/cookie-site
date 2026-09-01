const SHOPIFY_DOMAIN =
  "cookie-co.barxyhmr.myshopify.com";

const SHOPIFY_CLIENT_ID =
  "2619e33e3542c2a2e7e1431c6ac7edaf";

const REDIRECT_URI =
  "https://github.yourcookie.site/auth/callback.html";

const DISCOVERY_URL =
  `https://shopify.com/authentication/75827249230/.well-known/openid-configuration`;

const loginButton =
  document.getElementById("shopify-login");

const status =
  document.getElementById("status");


function randomString(length = 64) {

  const array =
    new Uint8Array(length);

  crypto.getRandomValues(array);

  return Array.from(array)
    .map(byte =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}


async function createCodeChallenge(verifier) {

  const data =
    new TextEncoder().encode(verifier);

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
      "Connecting to Shopify...";


    const discoveryResponse =
      await fetch(DISCOVERY_URL);


    if (!discoveryResponse.ok) {

      throw new Error(
        `Shopify discovery failed: ${discoveryResponse.status}`
      );

    }


    const config =
      await discoveryResponse.json();


    const state =
      randomString(32);

    const nonce =
      randomString(32);

    const codeVerifier =
      randomString(64);

    const codeChallenge =
      await createCodeChallenge(
        codeVerifier
      );


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


    const url =
      new URL(
        config.authorization_endpoint
      );


    url.searchParams.set(
      "client_id",
      SHOPIFY_CLIENT_ID
    );

    url.searchParams.set(
      "response_type",
      "code"
    );

    url.searchParams.set(
      "redirect_uri",
      REDIRECT_URI
    );

    url.searchParams.set(
      "scope",
      "openid email customer-account-api:full"
    );

    url.searchParams.set(
      "state",
      state
    );

    url.searchParams.set(
      "nonce",
      nonce
    );

    url.searchParams.set(
      "code_challenge",
      codeChallenge
    );

    url.searchParams.set(
      "code_challenge_method",
      "S256"
    );


    window.location.href =
      url.toString();

  } catch (error) {

    console.error(error);

    status.textContent =
      error.message;

  }

}


loginButton.addEventListener(
  "click",
  loginWithShopify
);