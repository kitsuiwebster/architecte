

function getData(form) {
  return Array.form(new FormData(form))
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;

        return acc;
      }
    )
}


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
        throw new Error('La connexion a échoué, vérifie ton adresse email et ton mot de passe');
      }

      const data = await response.json();

      if (data.userId && data.token) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
        alert('Tu es bien connecté!');
      } else {
        throw new Error('Une erreur est survenue');
      }
    } catch (error) {
      alert(error.message);
    }
  });
});
