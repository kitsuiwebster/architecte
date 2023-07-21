document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to login. Please check your email and password.');
      }

      const data = await response.json();

      if (data.userId && data.token) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
        alert('Login successful!');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      alert(error.message);
    }
  });
});
