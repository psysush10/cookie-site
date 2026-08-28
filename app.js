let activeJwtToken = null;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const logoutBtn = document.getElementById('logout-btn');
  const statusDiv = document.getElementById('status-message');

  // 1. LOGIN HANDLER
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameVal = document.getElementById('username-input').value;
    statusDiv.className = 'status';
    statusDiv.innerText = 'Authenticating with server...';

    // Fetch JWT from Vercel backend
    fetch('https://zendesk-auth-backend.vercel.app/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameVal })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          activeJwtToken = data.token;

          // Register JWT with Zendesk Messenger
          zE('messenger', 'loginUser', (callback) => {
            callback(activeJwtToken);
          });

          // Reset inputs on success
          loginForm.reset();

          // Update UI (Hide form, show Logout button)
          loginSection.style.display = 'none';
          logoutBtn.style.display = 'block';
          statusDiv.className = 'status logged-in';
          statusDiv.innerText = `Logged in as ${data.user.name}! Open the chat widget below.`;

          console.log('JWT registered with Zendesk for:', data.user.name);
        } else {
          statusDiv.className = 'status logged-out';
          statusDiv.innerText = 'Authentication failed.';
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        statusDiv.className = 'status logged-out';
        statusDiv.innerText = 'Error connecting to backend.';
      });

    // 2. LOGOUT HANDLER
logoutBtn.addEventListener('click', () => {
  statusDiv.className = 'status';
  statusDiv.innerText = 'Logging out...';

  // Terminate Zendesk authenticated session
  zE('messenger', 'logoutUser')
    .then(() => {
      activeJwtToken = null;

      // 1. Reset the login form inputs completely
      loginForm.reset();

      // 2. Restore the UI back to initial state
      loginSection.style.display = 'block';
      logoutBtn.style.display = 'none';
      
      statusDiv.className = 'status logged-out';
      statusDiv.innerText = 'You have logged out. Ready for a new login!';
      console.log('Zendesk session cleared. UI reset to initial state.');
    })
    .catch((error) => {
      console.error('Error logging out of Zendesk:', error);
      statusDiv.className = 'status logged-out';
      statusDiv.innerText = 'Logout failed.';
    });
  });
});

 

