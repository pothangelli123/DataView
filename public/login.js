document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientId = document.getElementById('clientId').value;
    const clientSecret = document.getElementById('clientSecret').value;
    const subdomain = document.getElementById('subdomain').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId, clientSecret, subdomain })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('subdomain', subdomain);
            window.location.href = '/dashboard';
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});