const toggleBtn = document.getElementById('toggle-theme');
const body = document.body;

// Load theme on page load
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
}

// Toggle theme
toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  if (body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});
