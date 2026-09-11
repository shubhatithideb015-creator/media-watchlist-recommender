// js/components/views/LoginView.js
// Login View for CinemaMatch

import { store } from '../../state/store.js';

export class LoginView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-md">

          <div class="text-center mb-8">
            <h1 class="font-cinematic text-4xl font-bold text-white">
              Cinema<span class="text-[#E50914]">Match</span>
            </h1>

            <p class="text-sm text-[#8E92A0] mt-2">
              Sign in to continue
            </p>
          </div>

          <div class="bg-[#121319] border border-[#232530] rounded-2xl p-6 sm:p-8">

            <h2 class="text-xl font-bold text-white mb-6">
              Welcome back
            </h2>

            <form id="login-form" class="space-y-4">

              <div>
                <label class="block text-xs font-semibold text-[#B8BBC6] mb-2">
                  Username
                </label>

                <input
                  id="login-username"
                  type="text"
                  required
                  class="w-full bg-[#0B0B0E] border border-[#232530] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#E50914]"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#B8BBC6] mb-2">
                  Password
                </label>

                <input
                  id="login-password"
                  type="password"
                  required
                  class="w-full bg-[#0B0B0E] border border-[#232530] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#E50914]"
                  placeholder="Enter your password"
                />
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                class="w-full bg-[#E50914] hover:bg-[#B80710] text-white font-bold py-3 rounded-xl transition"
              >
                Login
              </button>

            </form>

            <p class="text-center text-xs text-[#8E92A0] mt-6">
              Don't have an account?
              <button
                id="show-signup-btn"
                class="text-[#E50914] font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>

          </div>
        </div>
      </div>
    `;

    this.handleLogin();
  }

  handleLogin() {
    const form = this.container.querySelector('#login-form');
    const submitBtn = this.container.querySelector('#login-submit-btn');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = this.container.querySelector('#login-username').value;
      const password = this.container.querySelector('#login-password').value;

      // Disable button during request
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
      }

      try {
        const response = await fetch(
          `${window.__API_BASE_URL__}/api/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username,
              password
            })
          }
        );

        const data = await response.json();

        if (response.status === 200) {
          // Successful login
          store.login(data.user_id, data.username);
        } else {
          // Failed login - show error from backend
          store.showToast(data.error || 'Login failed', 'error');
        }

      } catch (error) {
        // Network/fetch error
        console.error('Login error:', error);
        store.showToast('Network error. Please check your connection.', 'error');
      } finally {
        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login';
        }
      }
    });
  }
}