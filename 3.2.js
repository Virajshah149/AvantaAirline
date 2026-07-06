document.addEventListener("DOMContentLoaded", () => {
  console.log("3.2.js loaded successfully");

  const form = document.querySelector(".details-form");
  const API_BASE = "http://localhost:5000";

  if (!form) {
    console.log("ERROR: .details-form not found in passenger page");
    alert("Form not found. Check class name details-form in HTML.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Passenger form submitted");

    const requiredFields = form.querySelectorAll("input[required], select[required], textarea[required]");
    let valid = true;
    let firstInvalid = null;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add("invalid");
        if (!firstInvalid) firstInvalid = field;
        valid = false;
      } else {
        field.classList.remove("invalid");
      }
    });

    if (!valid) {
      alert("Please fill all required fields marked with *");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const username = localStorage.getItem("username");
    const selectedFlightRaw = localStorage.getItem("selectedFlight");
    const seatDataRaw = localStorage.getItem("seatData");

    console.log("username:", username);
    console.log("selectedFlightRaw:", selectedFlightRaw);
    console.log("seatDataRaw:", seatDataRaw);

    if (!username) {
      alert("Please login first");
      window.location.href = "1login.html";
      return;
    }

    if (!selectedFlightRaw) {
      alert("Flight data missing. Please select flight again.");
      window.location.href = "3.0flight_select.html";
      return;
    }

    if (!seatDataRaw) {
      alert("Seat data missing. Please select seat again.");
      window.location.href = "3.1.html";
      return;
    }

    let flightData;
    let seatData;

    try {
      flightData = JSON.parse(selectedFlightRaw);
      seatData = JSON.parse(seatDataRaw);
    } catch (error) {
      alert("Stored flight/seat data is invalid. Please book again.");
      console.log(error);
      window.location.href = "3.0flight_select.html";
      return;
    }

    const textInputs = form.querySelectorAll("input[type='text']");

    const passengerName = textInputs[0] ? textInputs[0].value.trim() : "";
    const passengerEmail = form.querySelector("input[type='email']")
      ? form.querySelector("input[type='email']").value.trim()
      : "";
    const passengerPhone = form.querySelector("input[type='tel']")
      ? form.querySelector("input[type='tel']").value.trim()
      : "";

    const from = localStorage.getItem("from");
    const to = localStorage.getItem("to");
    const date = localStorage.getItem("date");

    const ticketNumber = "AVT-" + Date.now();
    const gate = "G" + (Math.floor(Math.random() * 8) + 1);
    const terminal = "T" + (Math.floor(Math.random() * 3) + 1);
    const boardingTime = "45 minutes before departure";
    const departureTime = flightData.time || "08:30 AM";

    const bookingData = {
      username: username,

      from: from,
      to: to,
      date: date,

      flightName: flightData.name,
      flightNumber: flightData.flightNumber,

      travelClass: seatData.travelClass,
      seatPosition: seatData.seatPosition,
      recliner: seatData.recliner,
      cabin: seatData.cabin,
      seatNumber: seatData.seatNumber,

      price: seatData.price,

      passengerName: passengerName,
      passengerEmail: passengerEmail,
      passengerPhone: passengerPhone,

      ticketNumber: ticketNumber,
      gate: gate,
      terminal: terminal,
      boardingTime: boardingTime,
      departureTime: departureTime
    };

    console.log("Final booking data sending to backend:", bookingData);

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (data.success === true) {
        localStorage.setItem("latestBooking", JSON.stringify(data.booking));

        

        window.location.href = "3.3confirm&pass.html";
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (error) {
      console.log("Booking save error:", error);
      alert("Backend server is not running or booking API failed.");
    }
  });

  form.querySelectorAll("input, select, textarea").forEach(input => {
    input.addEventListener("input", () => {
      if (input.value.trim()) {
        input.classList.remove("invalid");
      }
    });
  });
});