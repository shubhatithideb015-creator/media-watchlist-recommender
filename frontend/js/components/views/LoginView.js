// js/components/views/LoginView.js
// Login View for CinemaMatch

import { store } from '../../state/store.js';
import { getApiBaseUrl } from '../../services/api.js';

function getAuthApiBaseUrl() {
  return getApiBaseUrl() || 'http://localhost:5000';
}

export class LoginView {
  constructor(container) {
    this.container = container;
    this.isSignup = false;
  }

  render() {
    const isSignup = this.isSignup;

    this.container.innerHTML = `
      <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-md">

          <div class="text-center mb-8">
            <h1 class="font-cinematic text-4xl font-bold text-white">
              Cinema<span class="text-[#E50914]">Match</span>
            </h1>

            <p class="text-sm text-[#8E92A0] mt-2">
              ${isSignup ? 'Create an account to continue' : 'Sign in to continue'}
            </p>
          </div>

          <div class="bg-[#121319] border border-[#232530] rounded-2xl p-6 sm:p-8">

            <h2 class="text-xl font-bold text-white mb-6">
              ${isSignup ? 'Create account' : 'Welcome back'}
            </h2>

            <p id="auth-feedback" class="hidden text-xs mb-4"></p>

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
                ${isSignup ? 'Sign up' : 'Login'}
              </button>

            </form>

            <p class="text-center text-xs text-[#8E92A0] mt-6">
              ${isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                id="show-signup-btn"
                type="button"
                class="text-[#E50914] font-semibold hover:underline"
              >
                ${isSignup ? 'Login' : 'Sign up'}
              </button>
            </p>

          </div>
        </div>
      </div>
    `;

    this.bindAuthEvents();
  }

  showAuthFeedback(message, isError) {
    const el = this.container.querySelector('#auth-feedback');
    if (!el) return;
    el.textContent = message;
    el.className = isError
      ? 'text-xs mb-4 text-red-400'
      : 'text-xs mb-4 text-emerald-400';
  }

  bindAuthEvents() {
    const form = this.container.querySelector('#login-form');
    const submitBtn = this.container.querySelector('#login-submit-btn');
    const toggleBtn = this.container.querySelector('#show-signup-btn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (event) => {
        event.preventDefault();
        this.isSignup = !this.isSignup;
        this.render();
      });
    }

    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = this.container.querySelector('#login-username').value.trim();
      const password = this.container.querySelector('#login-password').value;
      const base = getAuthApiBaseUrl();
      const endpoint = this.isSignup ? '/api/auth/signup' : '/api/auth/login';
      const url = `${base}${endpoint}`;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = this.isSignup ? 'Creating account...' : 'Signing in...';
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            password
          })
        });

        const data = await response.json().catch(() => ({}));

        if (this.isSignup) {
          if (response.status === 201) {
            this.isSignup = false;
            this.render();
            this.showAuthFeedback(data.message || 'Account created. Please log in.', false);
          } else {
            this.showAuthFeedback(data.error || 'Signup failed', true);
          }
          return;
        }

        if (response.status === 200) {
          store.login(data.user_id, data.username);
        } else {
          this.showAuthFeedback(data.error || 'Login failed', true);
        }

      } catch (error) {
        console.error(this.isSignup ? 'Signup error:' : 'Login error:', error);
        this.showAuthFeedback('Network error. Please check your connection.', true);
      } finally {
        if (submitBtn && this.container.contains(submitBtn)) {
          submitBtn.disabled = false;
          submitBtn.textContent = this.isSignup ? 'Sign up' : 'Login';
        }
      }
    });
  }
}
