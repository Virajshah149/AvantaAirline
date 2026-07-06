const API_BASE = "http://localhost:5000";

function adminLogin() {
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;

  if (username === "" || password === "") {
    document.getElementById("msg").innerText = "Please enter username and password";
    return;
  }

  fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success === true) {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "admin-dashboard.html";
      } else {
        document.getElementById("msg").innerText = data.message;
      }
    })
    .catch(() => {
      document.getElementById("msg").innerText = "Backend server not running";
    });
}