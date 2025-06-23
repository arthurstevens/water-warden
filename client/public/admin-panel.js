// Visual utility for the admin panel
document.addEventListener('DOMContentLoaded', () => {
	// Populate date/time for announcements
    const initial = document.getElementById('announce-initial');
    const expiry = document.getElementById('announce-expiry');

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const defaultTime = `${yyyy}-${mm}-${dd}T00:00`;

    if (initial) initial.value = defaultTime;
    if (expiry) expiry.value = defaultTime;
});
