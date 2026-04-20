// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Get stored theme or default to light
    const storedTheme = localStorage.getItem('theme') || 'light';
    html.classList.toggle('dark', storedTheme === 'dark');
    updateToggleIcon(storedTheme);

    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const isDark = html.classList.toggle('dark');
        const theme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        updateToggleIcon(theme);
    });

    function updateToggleIcon(theme) {
        const icon = themeToggle.querySelector('.material-symbols-outlined');
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
});