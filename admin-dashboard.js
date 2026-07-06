const API_BASE = "http://localhost:5000";
const token = localStorage.getItem("adminToken");

let allBookings = [];

if (!token) {
  window.location.href = "admin.html";
}

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};

loadAllData();

function showMsg(message, color = "#ffd700") {
  const msg = document.getElementById("adminMsg");
  msg.innerText = message;
  msg.style.color = color;

  setTimeout(() => {
    msg.innerText = "";
  }, 3000);
}

function loadAllData() {
  loadSummary();
  loadUsers();
  loadBookings();
  loadSupportRequests();
}

function loadSummary() {
  fetch(`${API_BASE}/api/admin/summary`, {
    headers: headers
  })
    .then(res => res.json())
    .then(data => {
      if (data.success === false) {
        logout();
        return;
      }

      document.getElementById("totalUsers").innerText = data.totalUsers || 0;
      document.getElementById("totalBookings").innerText = data.totalBookings || 0;
      document.getElementById("totalRevenue").innerText = data.totalRevenue || 0;
      document.getElementById("totalSupportRequests").innerText = data.totalSupportRequests || 0;
    })
    .catch(() => {
      showMsg("Unable to load summary", "red");
    });
}

function loadUsers() {
  fetch(`${API_BASE}/api/admin/users`, {
    headers: headers
  })
    .then(res => res.json())
    .then(data => {
      const usersTable = document.getElementById("usersTable");

      if (!data.users || data.users.length === 0) {
        usersTable.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
        return;
      }

      usersTable.innerHTML = data.users.map(user => `
        <tr>
          <td>${user.name || ""}</td>
          <td>${user.email || ""}</td>
          <td>${user.phone || ""}</td>
          <td>${user.username || ""}</td>
          <td>${formatDate(user.createdAt)}</td>
          <td>
            <button class="delete-btn" onclick="deleteUser('${user._id}')">Delete</button>
          </td>
        </tr>
      `).join("");
    })
    .catch(() => {
      showMsg("Unable to load users", "red");
    });
}

function loadBookings() {
  fetch(`${API_BASE}/api/admin/bookings`, {
    headers: headers
  })
    .then(res => res.json())
    .then(data => {
      if (!data.bookings || data.bookings.length === 0) {
        allBookings = [];
        document.getElementById("bookingsTable").innerHTML =
          `<tr><td colspan="15">No bookings found</td></tr>`;
        return;
      }

      allBookings = data.bookings;
      renderBookings(allBookings);
    })
    .catch(() => {
      showMsg("Unable to load bookings", "red");
    });
}

function renderBookings(bookings) {
  const bookingsTable = document.getElementById("bookingsTable");

  if (!bookings || bookings.length === 0) {
    bookingsTable.innerHTML = `<tr><td colspan="15">No matching bookings found</td></tr>`;
    return;
  }

  bookingsTable.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.ticketNumber || "N/A"}</td>
      <td>${b.username || ""}</td>
      <td>${b.passengerName || ""}</td>
      <td>${b.passengerEmail || ""}</td>
      <td>${b.from || ""} → ${b.to || ""}</td>
      <td>${b.flightName || ""}<br><small>${b.flightNumber || ""}</small></td>
      <td>${b.date || "N/A"}</td>
      <td>${b.departureTime || "08:30 AM"}</td>
      <td>${b.seatNumber || "N/A"}</td>
      <td>${b.gate || "N/A"}</td>
      <td>${b.terminal || "N/A"}</td>
      <td>₹${b.price || 0}</td>
      <td>
        <span class="status-pill ${getStatusClass(b.status)}">
          ${b.status || "Confirmed"}
        </span>
      </td>
      <td>
        <select onchange="updateBookingStatus('${b._id}', this.value)">
          <option value="Confirmed" ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
          <option value="On Time" ${b.status === "On Time" ? "selected" : ""}>On Time</option>
          <option value="Boarding" ${b.status === "Boarding" ? "selected" : ""}>Boarding</option>
          <option value="Delayed" ${b.status === "Delayed" ? "selected" : ""}>Delayed</option>
          <option value="Cancelled" ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          <option value="Departed" ${b.status === "Departed" ? "selected" : ""}>Departed</option>
        </select>
      </td>
      <td>
        <button class="delete-btn" onclick="deleteBooking('${b._id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

function updateBookingStatus(id, status) {
  fetch(`${API_BASE}/api/admin/bookings/status/${id}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      status: status
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showMsg("Flight status updated successfully", "lightgreen");
        loadSummary();
        loadBookings();
      } else {
        showMsg(data.message || "Status update failed", "red");
      }
    })
    .catch(() => {
      showMsg("Backend error while updating status", "red");
    });
}

function loadSupportRequests() {
  fetch(`${API_BASE}/api/admin/support`, {
    headers: headers
  })
    .then(res => res.json())
    .then(data => {
      const supportTable = document.getElementById("supportTable");

      if (!data.requests || data.requests.length === 0) {
        supportTable.innerHTML = `<tr><td colspan="6">No support requests found</td></tr>`;
        return;
      }

      supportTable.innerHTML = data.requests.map(s => `
        <tr>
          <td>${s.name || ""}</td>
          <td>${s.email || ""}</td>
          <td>${s.subject || ""}</td>
          <td>${s.message || ""}</td>
          <td>${s.status || "Pending"}</td>
          <td>${formatDate(s.createdAt)}</td>
        </tr>
      `).join("");
    })
    .catch(() => {
      showMsg("Unable to load support requests", "red");
    });
}

function deleteBooking(id) {
  if (!confirm("Are you sure you want to delete this booking?")) {
    return;
  }

  fetch(`${API_BASE}/api/admin/bookings/${id}`, {
    method: "DELETE",
    headers: headers
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showMsg("Booking deleted successfully", "lightgreen");
        loadAllData();
      } else {
        showMsg(data.message || "Delete failed", "red");
      }
    })
    .catch(() => {
      showMsg("Backend error while deleting booking", "red");
    });
}

function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: headers
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showMsg("User deleted successfully", "lightgreen");
        loadAllData();
      } else {
        showMsg(data.message || "Delete failed", "red");
      }
    })
    .catch(() => {
      showMsg("Backend error while deleting user", "red");
    });
}

function filterBookings() {
  const search = document.getElementById("bookingSearch").value.toLowerCase().trim();

  if (!search) {
    renderBookings(allBookings);
    return;
  }

  const filtered = allBookings.filter(b => {
    return (
      (b.ticketNumber || "").toLowerCase().includes(search) ||
      (b.flightNumber || "").toLowerCase().includes(search) ||
      (b.flightName || "").toLowerCase().includes(search) ||
      (b.passengerName || "").toLowerCase().includes(search) ||
      (b.passengerEmail || "").toLowerCase().includes(search) ||
      (b.from || "").toLowerCase().includes(search) ||
      (b.to || "").toLowerCase().includes(search) ||
      (b.status || "").toLowerCase().includes(search)
    );
  });

  renderBookings(filtered);
}

function clearBookingSearch() {
  document.getElementById("bookingSearch").value = "";
  renderBookings(allBookings);
}

function getStatusClass(status) {
  if (!status) return "status-confirmed";

  const s = status.toLowerCase();

  if (s === "confirmed") return "status-confirmed";
  if (s === "on time") return "status-on-time";
  if (s === "boarding") return "status-boarding";
  if (s === "delayed") return "status-delayed";
  if (s === "cancelled") return "status-cancelled";
  if (s === "departed") return "status-departed";

  return "status-confirmed";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin.html";
}