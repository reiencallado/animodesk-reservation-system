const themeStorageKey = 'animoTheme';

function getSavedTheme() {
    return localStorage.getItem(themeStorageKey) || 'light';
}

function renderThemeButton(button, mode) {
    if (!button) return;
    const icon = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    button.innerHTML = `<i class="${icon}"></i> ${mode === 'dark' ? 'Light mode' : 'Dark mode'}`;
}

function applyTheme(mode) {
    document.body.classList.toggle('dark-mode', mode === 'dark');
    renderThemeButton(document.getElementById('themeToggle'), mode);
    localStorage.setItem(themeStorageKey, mode);
}

function toggleTheme() {
    const nextMode = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextMode);
}

document.addEventListener('DOMContentLoaded', () => {
    const mode = getSavedTheme();
    applyTheme(mode);
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.addEventListener('click', toggleTheme);
    }
});
