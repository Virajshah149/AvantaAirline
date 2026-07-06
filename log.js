
document.addEventListener('DOMContentLoaded', function () {
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const loginBtn = document.querySelector('.login-form button');

  // Create password toggle icon
  const toggle = document.createElement('i');
  toggle.className = 'fas fa-eye password-toggle';
  toggle.title = 'Show/Hide Password';
  const wrapper = document.createElement('div');
  wrapper.className = 'password-wrapper';
  password.parentNode.insertBefore(wrapper, password);
  wrapper.appendChild(password);
  wrapper.appendChild(toggle);

  // Toggle password visibility
  toggle.addEventListener('click', () => {
    const isVisible = password.type === 'text';
    password.type = isVisible ? 'password' : 'text';
    toggle.classList.toggle('fa-eye-slash', !isVisible);
  });

  // Disable button until both inputs are filled
  function checkInputs() {
    loginBtn.disabled = !(username.value.trim() && password.value.trim());
  }

  username.addEventListener('input', checkInputs);
  password.addEventListener('input', checkInputs);
  checkInputs(); // run once on load
});
