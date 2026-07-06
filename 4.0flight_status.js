document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:5000";

  const statusForm = document.getElementById("statusForm");
  const searchInput = document.getElementById("searchValue");
  const message = document.getElementById("message");
  const statusResults = document.getElementById("statusResults");

  statusForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const searchValue = searchInput.value.trim();

    if (!searchValue) {
      showMessage("Please enter ticket number or flight number.", "red");
      return;
    }

    statusResults.innerHTML = "";
    showMessage("Searching flight status...", "#ffd700");

    try {
      const res = await fetch(`${API_BASE}/api/flight-status/${searchValue}`);
      const data = await res.json();

      if (!data.success) {
        showMessage(data.message || "No flight found.", "red");
        return;
      }

      showMessage("Flight status loaded successfully.", "green");
      displayFlights(data.bookings);

    } catch (error) {
      console.log(error);
      showMessage("Backend server error. Please try again.", "red");
    }
  });

  function displayFlights(bookings) {
    statusResults.innerHTML = "";

    bookings.forEach(booking => {
      const statusClass = getStatusClass(booking.status);
      const fromCode = shortCity(booking.from);
      const toCode = shortCity(booking.to);

      const card = document.createElement("div");
      card.className = "status-card";

      card.innerHTML = `
        <div class="status-top">
          <div class="flight-title">
            <h3>${booking.flightName || "Avanta Flight"}</h3>
            <p>Flight No: ${booking.flightNumber || "N/A"} | Ticket: ${booking.ticketNumber || "N/A"}</p>
          </div>

          <span class="status-badge ${statusClass}">
            ${booking.status || "Confirmed"}
          </span>
        </div>

        <div class="route-box">
          <div class="city">
            <h2>${fromCode}</h2>
            <p>${booking.from || "N/A"}</p>
          </div>

          <div class="plane-icon">✈</div>

          <div class="city">
            <h2>${toCode}</h2>
            <p>${booking.to || "N/A"}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <small>Passenger</small>
            <span>${booking.passengerName || "N/A"}</span>
          </div>

          <div class="info-box">
            <small>Date</small>
            <span>${booking.date || "N/A"}</span>
          </div>

          <div class="info-box">
            <small>Departure Time</small>
            <span>${booking.departureTime || "08:30 AM"}</span>
          </div>

          <div class="info-box">
            <small>Boarding Time</small>
            <span>${booking.boardingTime || "45 minutes before departure"}</span>
          </div>

          <div class="info-box">
            <small>Terminal</small>
            <span>${booking.terminal || "N/A"}</span>
          </div>

          <div class="info-box">
            <small>Gate</small>
            <span>${booking.gate || "N/A"}</span>
          </div>

          <div class="info-box">
            <small>Seat</small>
            <span>${booking.seatNumber || "N/A"}</span>
          </div>

          <div class="info-box">
            <small>Email</small>
            <span>${booking.passengerEmail || "N/A"}</span>
          </div>
        </div>

        <div class="action-row">
          <button class="view-ticket-btn" onclick='viewTicket(${JSON.stringify(booking)})'>
            View Boarding Pass
          </button>

          <button class="support-btn" onclick="goSupport()">
            Need Help?
          </button>
        </div>
      `;

      statusResults.appendChild(card);
    });
  }

  function showMessage(text, color) {
    message.innerText = text;
    message.style.color = color;
  }
});

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

function shortCity(city) {
  if (!city) return "AV";

  const cityMap = {
    "Mumbai": "BOM",
    "Delhi": "DEL",
    "Ahmedabad": "AMD",
    "Bangalore": "BLR",
    "Vadodara": "BDQ",
    "Goa": "GOI",
    "Chennai": "MAA",
    "Hyderabad": "HYD",
    "Kolkata": "CCU",
    "Pune": "PNQ"
  };

  return cityMap[city] || city.substring(0, 3).toUpperCase();
}

function viewTicket(booking) {
  localStorage.setItem("latestBooking", JSON.stringify(booking));
  window.location.href = "3.3confirm&pass.html";
}

function goSupport() {
  window.location.href = "7.0support.html";
}