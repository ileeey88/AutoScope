document.addEventListener('DOMContentLoaded', async () => {
  const navLogin = document.getElementById('nav-login');
  const compareLink = document.getElementById('compare-link');
  const compareCount = document.getElementById('compare-count');

  function getErrorMessage(errData) {
    if (!errData || !errData.detail) return 'Произошла ошибка';
    const detail = errData.detail;
    
    if (Array.isArray(detail)) {
      return detail.map(e => e.msg).join(', ');
    }
    if (typeof detail === 'string') {
      return detail;
    }
    return 'Ошибка валидации данных';
  }

  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      if (navLogin) {
        navLogin.textContent = 'Профиль';
        navLogin.href = 'profile.html';
      }
    } else if (window.location.pathname.includes('profile.html')) {
      window.location.href = 'login.html';
    }
  } catch (e) {
    console.error('Ошибка проверки авторизации', e);
  }

  try {
    const res = await fetch('/api/favorites');
    if (res.ok) {
      const favorites = await res.json();
      if (compareLink && compareCount) {
        if (favorites.length > 0) {
          compareLink.style.visibility = 'visible';
          compareCount.textContent = favorites.length;
        } else {
          compareLink.style.visibility = 'hidden';
        }
      }
    }
  } catch (e) {
    console.error('Ошибка загрузки избранного', e);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      document.getElementById('login-email-error').textContent = '';
      document.getElementById('login-password-error').textContent = '';

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        window.location.href = 'index.html';
      } else {
        const err = await res.json();
        document.getElementById('login-email-error').textContent = getErrorMessage(err);
      }
    });
  }

  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      
      document.getElementById('reg-email-error').textContent = '';
      document.getElementById('reg-name-error').textContent = '';
      document.getElementById('reg-password-error').textContent = '';

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (res.ok) {
        window.location.href = 'index.html';
      } else {
        const err = await res.json();
        document.getElementById('reg-email-error').textContent = getErrorMessage(err);
      }
    });
  }
});