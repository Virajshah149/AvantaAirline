document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://localhost:5000";
  const username = localStorage.getItem("username");

  if (!username) {
    alert("Please login first");
    window.location.href = "1login.html";
    return;
  }

  const bookingList = document.getElementById("bookingList");

  // ================= PROFILE =================
  try {
    const resProfile = await fetch(`${API_BASE}/api/profile/${username}`);
    const profileData = await resProfile.json();

    if (profileData.success === true && profileData.user) {
      const user = profileData.user;
      const firstName = user.name ? user.name.split(" ")[0] : username;

      document.querySelector("header h1").textContent = `Welcome, ${firstName}`;
      document.querySelector(".profile-info h2").textContent = user.name || username;

      const profileInfo = document.querySelector(".profile-info");

      profileInfo.innerHTML = `
        <h2>${user.name || username}</h2>
        <p><strong>Email:</strong> ${user.email || "Not added"}</p>
        <p><strong>Phone:</strong> ${user.phone || "Not added"}</p>
        <p><strong>Flyer No:</strong> ${user.flyer || "AV1234567"}</p>
      `;

      // Preferences card
      const preferenceCard = document.querySelectorAll(".card")[0];

      if (preferenceCard) {
        preferenceCard.innerHTML = `
          <h3>Preferences</h3>
          <p>Meal: ${user.meal || "Vegetarian"}</p>
          <p>Seat: ${user.seat || "Aisle"}</p>
          <p>Notifications: ${user.notifications ? "Enabled" : "Disabled"}</p>
        `;
      }

      // Loyalty card
      const loyaltyCard = document.querySelectorAll(".card")[1];

      if (loyaltyCard) {
        loyaltyCard.innerHTML = `
          <h3>Loyalty Status</h3>
          <p>Status: <strong>${user.loyaltyStatus || "Platinum"}</strong></p>
          <p>Miles Earned: <strong>${user.milesEarned || 82350}</strong></p>
          <p>Next Tier: <strong>Diamond</strong></p>
        `;
      }
    }
  } catch (err) {
    console.error("Profile fetch error:", err);
    alert("Unable to load profile details");
  }

  // ================= BOOKINGS =================
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${username}`);
    const data = await res.json();

    if (!bookingList) {
      console.error("bookingList not found in HTML");
      return;
    }

    bookingList.innerHTML = "";

    if (!data.success || !data.bookings || data.bookings.length === 0) {
      bookingList.innerHTML = "<li>No bookings yet</li>";
      return;
    }

    data.bookings.forEach(booking => {
      bookingList.innerHTML += `
        <li style="margin-bottom: 18px; line-height: 1.7;">
          <strong>${booking.flightName || "Avanta Flight"}</strong>
          <br>
          Flight No: ${booking.flightNumber || "N/A"}
          <br>
          Route: ${booking.from || "N/A"} → ${booking.to || "N/A"}
          <br>
          Date: ${booking.date || "N/A"}
          <br>
          Passenger: ${booking.passengerName || "N/A"}
          <br>
          Seat: ${booking.seatNumber || "N/A"} (${booking.seatPosition || "N/A"})
          <br>
          Class: ${booking.travelClass || "N/A"}
          <br>
          Price: ₹${booking.price || 0}
          <br>
          Status: <strong>${booking.status || "Confirmed"}</strong>
          <br><br>

          <button onclick='viewTicket(${JSON.stringify(booking)})' style="padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer;">
            View Ticket
          </button>

          ${
            booking.status !== "Cancelled"
              ? `<button onclick="cancelBooking('${booking._id}')" style="padding: 8px 12px; border: none; border-radius: 6px; background: #ff4d4d; color: white; cursor: pointer; margin-left: 8px;">
                  Cancel Booking
                </button>`
              : ""
          }
        </li>
      `;
    });

  } catch (err) {
    console.error("Booking fetch error:", err);

    if (bookingList) {
      bookingList.innerHTML = "<li>Unable to load bookings</li>";
    }
  }
});

// View ticket again
function viewTicket(booking) {
  localStorage.setItem("latestBooking", JSON.stringify(booking));
  window.location.href = "3.3confirm&pass.html";
}

// Cancel booking
async function cancelBooking(bookingId) {
  const confirmCancel = confirm("Are you sure you want to cancel this booking?");

  if (!confirmCancel) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/bookings/cancel/${bookingId}`, {
      method: "PUT"
    });

    const data = await res.json();

    if (data.success) {
      alert("Booking cancelled successfully");
      window.location.reload();
    } else {
      alert(data.message || "Cancellation failed");
    }
  } catch (error) {
    console.error(error);
    alert("Backend error while cancelling booking");
  }
}