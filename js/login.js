document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.userId && data.token) {
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('token', data.token);
    }
  });
});
