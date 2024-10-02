document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        document.getElementById('accessToken').textContent = accessToken;
    } else {
        alert('No access token found. Please log in again.');
        window.location.href = '/';
    }
});