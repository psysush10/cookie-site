/**
 * Customer Portal Application Logic
 * Integrates custom frontend login/logout state with Zendesk Messaging JWT Authentication.
 */

let activeJwtToken = null;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const usernameInput = document.getElementById('username-input');
  const logoutBtn = document.getElementById('logout-btn');
  const statusDiv = document.getElementById('status-message');

  // Safety check to ensure DOM elements exist
  if (!loginForm || !loginSection || !logoutBtn || !statusDiv) {
    console.error('One or more required DOM elements were not found.');
    return;
  }

  // Configuration: Replace with your live Vercel endpoint URL
  const AUTH_ENDPOINT = 'https://zedesk-auth-backend.vercel.app/api/token';

  // ==========================================
  // 1. LOGIN HANDLER
  // ==========================================
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameVal = usernameInput.value.trim();
    if (!usernameVal) {
      statusDiv.className = 'status logged-out';
      statusDiv.innerText = 'Please enter a valid name.';
      return;
    }

    statusDiv.className = 'status';
    statusDiv.innerText = 'Authenticating with server...';

    // Fetch dynamic JWT from Vercel backend
    fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ username: usernameVal })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned HTTP status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          // Store token in application memory
          activeJwtToken = data.token;

          // Register JWT callback with Zendesk Web Widget
          zE('messenger', 'loginUser', (callback) => {
            callback(activeJwtToken);
          });

          // Reset input fields
          loginForm.reset();

          // Update UI state: Hide form, show Logout button
          loginSection.style.display = 'none';
          logoutBtn.style.display = 'block';
          
          statusDiv.className = 'status logged-in';
          statusDiv.innerText = `Logged in as ${data.user.name}! Open the chat widget below.`;

          console.log(`[Zendesk Auth] JWT registered for: ${data.user.name}`);
        } else {
          statusDiv.className = 'status logged-out';
          statusDiv.innerText = data.error || 'Authentication failed: No token returned.';
        }
      })
      .catch((err) => {
        console.error('[Zendesk Auth Error]:', err);
        statusDiv.className = 'status logged-out';
        statusDiv.innerText = 'Error connecting to authentication server.';
      });
  });

  // ==========================================
  // 2. LOGOUT HANDLER
  // ==========================================
  logoutBtn.addEventListener('click', () => {
    statusDiv.className = 'status';
    statusDiv.innerText = 'Logging out...';

    // Terminate Zendesk authenticated session
    zE('messenger', 'logoutUser')
      .then(() => {
        // Clear local memory reference
        activeJwtToken = null;

        // Reset input fields completely
        loginForm.reset();

        // Restore UI state back to initial state
        loginSection.style.display = 'block';
        logoutBtn.style.display = 'none';

        statusDiv.className = 'status logged-out';
        statusDiv.innerText = 'You have logged out. Ready for a new login!';
        
        console.log('[Zendesk Auth] Session cleared. UI restored to initial state.');
      })
      .catch((error) => {
        console.error('[Zendesk Logout Error]:', error);
        statusDiv.className = 'status logged-out';
        statusDiv.innerText = 'Logout failed. Please try again.';
      });
  });
});
