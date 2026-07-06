document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const forms = document.querySelectorAll(".form");
  const toggleButtons = document.querySelectorAll(".toggle-password");
  const darkToggle = document.querySelector(".dark-toggle");

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  // Backend API URL
  const API_BASE = "http://localhost:5000";

  // Tab switch: Login / Signup
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      forms.forEach(f => f.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(`${tab.dataset.tab}-form`).classList.add("active");
    });
  });

  // Toggle password show/hide
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);

      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }

      btn.classList.toggle("fa-eye-slash");
    });
  });

  // Dark mode
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      darkToggle.textContent = "☀️";
    } else {
      darkToggle.textContent = "🌙";
    }
  });

  // Enable button only when all inputs are filled
  document.querySelectorAll("form").forEach(form => {
    const inputs = form.querySelectorAll("input");
    const button = form.querySelector("button");

    function checkFilled() {
      const allFilled = Array.from(inputs).every(input => input.value.trim() !== "");
      button.disabled = !allFilled;
    }

    inputs.forEach(input => {
      input.addEventListener("input", checkFilled);
    });

    checkFilled();
  });

  // LOGIN FORM
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await res.json();

      if (data.success === true) {
        alert("Login successful!");

        // Save logged-in user details in browser
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("phone", data.user.phone);

        // Go to dashboard
        window.location.href = "2dash.html";
      } else {
        alert(data.message || "Invalid username or password");
      }
    } catch (error) {
      alert("Backend server is not running. Please start server using node server.js");
      console.log(error);
    }
  });

  // SIGNUP FORM
  signupForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          username: username,
          password: password
        })
      });

      const data = await res.json();

      if (data.success === true) {
        alert("Signup successful! Now login.");

        // Clear signup fields
        document.getElementById("signup-name").value = "";
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-phone").value = "";
        document.getElementById("signup-username").value = "";
        document.getElementById("signup-password").value = "";

        // Switch to login tab automatically
        document.querySelector('[data-tab="login"]').click();
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      alert("Backend server is not running. Please start server using node server.js");
      console.log(error);
    }
  });
});