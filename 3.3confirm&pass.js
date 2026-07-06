let currentBookingForOtp = null;

document.addEventListener("DOMContentLoaded", async () => {
  const ticketArea = document.getElementById("ticketArea");

  let booking = JSON.parse(localStorage.getItem("latestBooking"));

  if (!booking) {
    const username = localStorage.getItem("username");

    if (username) {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${username}`);
        const data = await res.json();

        if (data.success && data.bookings.length > 0) {
          booking = data.bookings[0];
          localStorage.setItem("latestBooking", JSON.stringify(booking));
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  if (!booking) {
    document.getElementById("otpOverlay").style.display = "none";

    ticketArea.classList.remove("locked");
    ticketArea.innerHTML = `
      <div class="error-box">
        <h2>No Booking Found</h2>
        <p>Please complete a flight booking first.</p>
        <button class="action-btn download" onclick="bookMore()">Book Flight</button>
      </div>
    `;
    return;
  }

  currentBookingForOtp = booking;

  renderBoardingPass(booking);

  document.getElementById("otpTicketInfo").innerText = booking.ticketNumber || "Ticket Verification";

  await sendBookingOtp();
});

async function sendBookingOtp() {
  const otpMsg = document.getElementById("otpMsg");

  if (!currentBookingForOtp) {
    otpMsg.innerText = "Booking not found";
    otpMsg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/booking/send-pass-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticketNumber: currentBookingForOtp.ticketNumber,
        email: currentBookingForOtp.passengerEmail
      })
    });

    const data = await res.json();

    if (data.success) {
      otpMsg.innerText = "OTP sent Successfully. Check server terminal for demo OTP.";
      otpMsg.style.color = "green";
    } else {
      otpMsg.innerText = data.message;
      otpMsg.style.color = "red";
    }
  } catch (error) {
    console.log(error);
    otpMsg.innerText = "Backend error while sending OTP";
    otpMsg.style.color = "red";
  }
}

async function verifyBookingOtp() {
  const otp = document.getElementById("bookingOtpInput").value.trim();
  const otpMsg = document.getElementById("otpMsg");

  if (!otp) {
    otpMsg.innerText = "Please enter OTP";
    otpMsg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/booking/verify-pass-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticketNumber: currentBookingForOtp.ticketNumber,
        email: currentBookingForOtp.passengerEmail,
        otp: otp
      })
    });

    const data = await res.json();

    if (data.success) {
      otpMsg.innerText = "OTP verified successfully";
      otpMsg.style.color = "green";

      setTimeout(() => {
        document.getElementById("otpOverlay").style.display = "none";
        document.getElementById("ticketArea").classList.remove("locked");
      }, 500);
    } else {
      otpMsg.innerText = data.message;
      otpMsg.style.color = "red";
    }
  } catch (error) {
    console.log(error);
    otpMsg.innerText = "Backend error while verifying OTP";
    otpMsg.style.color = "red";
  }
}

function renderBoardingPass(booking) {
  const ticketArea = document.getElementById("ticketArea");

  const passengerName = booking.passengerName || "Passenger";
  const passengerEmail = booking.passengerEmail || "Not Available";
  const passengerPhone = booking.passengerPhone || "Not Available";

  const flightName = booking.flightName || "Avanta Flight";
  const flightNumber = booking.flightNumber || "AV000";
  const ticketNumber = booking.ticketNumber || generateTicketNumber();

  const from = booking.from || "FROM";
  const to = booking.to || "TO";
  const date = booking.date || "Not Available";

  const gate = booking.gate || generateGate();
  const terminal = booking.terminal || generateTerminal();
  const seatNumber = booking.seatNumber || "N/A";

  const departureTime = booking.departureTime || "08:30 AM";
  const boardingTime = booking.boardingTime || "45 minutes before departure";

  const status = booking.status || "Confirmed";
  const statusClass = status.toLowerCase() === "cancelled" ? "cancelled" : "confirmed";

  const baggage = getBaggageAllowance(booking.travelClass || "Economy");
  const boardingGroup = generateBoardingGroup();
  const checkInZone = generateCheckInZone();

  ticketArea.innerHTML = `
    <div class="ticket-wrapper" id="boardingPass">

      <div class="ticket-main">

        <div class="ticket-title">
          <h2>BOARDING PASS</h2>
          <span class="status ${statusClass}">${status}</span>
        </div>

        <div class="passenger-row">
          <div>
            <small class="label">Passenger Name</small>
            <span class="value">${passengerName}</span>
          </div>

          <div>
            <small class="label">Email</small>
            <span class="value">${passengerEmail}</span>
          </div>

          <div>
            <small class="label">Phone</small>
            <span class="value">${passengerPhone}</span>
          </div>
        </div>

        <div class="route">
          <div class="city">
            <h1>${shortCity(from)}</h1>
            <p>${from}</p>
          </div>

          <div class="plane-line">✈</div>

          <div class="city">
            <h1>${shortCity(to)}</h1>
            <p>${to}</p>
          </div>
        </div>

        <div class="time-strip">
          <div>
            <small>Departure Date</small>
            <span>${date}</span>
          </div>

          <div>
            <small>Departure Time</small>
            <span>${departureTime}</span>
          </div>

          <div>
            <small>Boarding Time</small>
            <span>${boardingTime}</span>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-box">
            <small class="label">Flight Name</small>
            <span class="value">${flightName}</span>
          </div>

          <div class="detail-box">
            <small class="label">Flight Number</small>
            <span class="value">${flightNumber}</span>
          </div>

          <div class="detail-box">
            <small class="label">Ticket Number</small>
            <span class="value">${ticketNumber}</span>
          </div>

          <div class="detail-box">
            <small class="label">Terminal</small>
            <span class="value">${terminal}</span>
          </div>

          <div class="detail-box">
            <small class="label">Gate</small>
            <span class="value">${gate}</span>
          </div>

          <div class="detail-box">
            <small class="label">Seat Number</small>
            <span class="value">${seatNumber}</span>
          </div>

          <div class="detail-box">
            <small class="label">Boarding Group</small>
            <span class="value">${boardingGroup}</span>
          </div>

          <div class="detail-box">
            <small class="label">Check-in Zone</small>
            <span class="value">${checkInZone}</span>
          </div>

          <div class="detail-box">
            <small class="label">Baggage</small>
            <span class="value">${baggage}</span>
          </div>
        </div>

        <div class="note-box">
          <strong>Airport Note:</strong> Please reach the airport at least 2 hours before departure.
          Gate closes 20 minutes before departure.
          ${
            statusClass === "cancelled"
              ? "<br><span class='cancel-note'>This booking is cancelled. This boarding pass is not valid for travel.</span>"
              : ""
          }
        </div>

      </div>

      <div class="ticket-side">

        <div>
          <div class="side-title">AVANTA AIRLINE</div>

          <div class="mini-route">
            <h3>${shortCity(from)} → ${shortCity(to)}</h3>
          </div>

          <div class="side-info">
            <small>Passenger</small>
            <span>${passengerName}</span>
          </div>

          <div class="side-info">
            <small>Flight</small>
            <span>${flightNumber}</span>
          </div>

          <div class="side-info">
            <small>Date & Time</small>
            <span>${date} | ${departureTime}</span>
          </div>

          <div class="side-info">
            <small>Seat / Gate</small>
            <span>${seatNumber} / ${gate}</span>
          </div>

          <div class="side-info">
            <small>Status</small>
            <span style="color:${statusClass === "cancelled" ? "#c62828" : "#0f7a2a"}">${status}</span>
          </div>
        </div>

        <div>
          <div class="barcode"></div>
          <div class="ticket-number">${ticketNumber}</div>
        </div>

      </div>

    </div>
  `;
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

function generateGate() {
  return "G" + (Math.floor(Math.random() * 8) + 1);
}

function generateTerminal() {
  return "T" + (Math.floor(Math.random() * 3) + 1);
}

function generateTicketNumber() {
  return "AVT-" + Date.now();
}

function generateCheckInZone() {
  const zones = ["A", "B", "C", "D"];
  return zones[Math.floor(Math.random() * zones.length)];
}

function generateBoardingGroup() {
  const groups = ["Group 1", "Group 2", "Group 3", "Priority"];
  return groups[Math.floor(Math.random() * groups.length)];
}

function getBaggageAllowance(travelClass) {
  const cls = travelClass.toLowerCase();

  if (cls === "first") return "40 KG";
  if (cls === "business") return "30 KG";

  return "20 KG";
}

function downloadTicket() {
  const boardingPass = document.getElementById("boardingPass");

  if (!boardingPass) {
    alert("Boarding pass not found");
    return;
  }

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow popups to download/print the ticket");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Avanta Boarding Pass</title>

      <style>
        @page {
          size: A4 landscape;
          margin: 6mm;
        }

        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 297mm;
          height: 210mm;
          background: white;
          overflow: hidden;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .print-page {
          width: 282mm;
          height: 195mm;
          padding: 0;
          margin: 0 auto;
          overflow: hidden;
        }

        .ticket-wrapper {
          width: 100%;
          height: auto;
          max-height: 190mm;
          background: #f7f9fc;
          color: #06152b;
          border-radius: 14px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 2.35fr 0.85fr;
          border: 2px solid #cbd5e1;
          box-shadow: none;
          transform: scale(0.96);
          transform-origin: top center;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .ticket-main {
          padding: 18px;
          background: #f7f9fc;
          position: relative;
        }

        .ticket-main::after {
          content: "";
          position: absolute;
          right: 0;
          top: 16px;
          bottom: 16px;
          border-right: 2px dashed #a9b5c8;
        }

        .ticket-side {
          background: linear-gradient(180deg, #eef5ff, #f9fbff);
          color: #06152b;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ticket-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.8px solid #dce3ef;
          padding-bottom: 9px;
          margin-bottom: 10px;
        }

        .ticket-title h2 {
          margin: 0;
          color: #06152b;
          font-size: 23px;
          letter-spacing: 1px;
        }

        .status {
          padding: 6px 12px;
          border-radius: 18px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
        }

        .status.confirmed {
          background: #d7f9df;
          color: #0f7a2a;
        }

        .status.cancelled {
          background: #ffe0e0;
          color: #c62828;
        }

        .passenger-row {
          background: #ffffff;
          border: 1px solid #dce3ef;
          border-radius: 11px;
          padding: 10px;
          display: grid;
          grid-template-columns: 1.2fr 1.4fr 0.9fr;
          gap: 10px;
          margin-bottom: 10px;
        }

        .label {
          color: #6b7280;
          display: block;
          margin-bottom: 3px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 9.5px;
          letter-spacing: 0.4px;
        }

        .value {
          font-size: 13.5px;
          font-weight: bold;
          color: #06152b;
          word-break: break-word;
        }

        .route {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: center;
          margin: 12px 0;
          text-align: center;
        }

        .city h1 {
          margin: 0;
          font-size: 36px;
          color: #0b2345;
          line-height: 1;
        }

        .city p {
          margin: 4px 0 0;
          color: #6b7280;
          font-weight: bold;
          font-size: 12px;
        }

        .plane-line {
          color: #d4af37;
          font-size: 28px;
          font-weight: bold;
        }

        .time-strip {
          background: #06152b;
          color: white;
          border-radius: 10px;
          padding: 10px 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 10px 0;
        }

        .time-strip small {
          display: block;
          color: #b8c7e0;
          text-transform: uppercase;
          font-size: 9.5px;
          margin-bottom: 3px;
          font-weight: bold;
        }

        .time-strip span {
          color: white;
          font-weight: bold;
          font-size: 13px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .detail-box {
          background: #ffffff;
          padding: 9px;
          border-radius: 9px;
          border: 1px solid #dce3ef;
          min-height: 52px;
        }

        .note-box {
          margin-top: 10px;
          background: #fff8df;
          border-left: 4px solid #d4af37;
          padding: 8px;
          border-radius: 7px;
          color: #4b3b00;
          font-size: 11.5px;
          line-height: 1.35;
        }

        .cancel-note {
          color: #c62828;
          font-weight: bold;
        }

        .side-title {
          color: #0b2345;
          font-size: 17px;
          margin-bottom: 10px;
          font-weight: bold;
          letter-spacing: 1px;
          border-bottom: 1px solid #d6dce8;
          padding-bottom: 8px;
        }

        .mini-route {
          background: #ffffff;
          border: 1px solid #dce3ef;
          padding: 9px;
          border-radius: 9px;
          margin-bottom: 9px;
          text-align: center;
        }

        .mini-route h3 {
          color: #0b2345;
          margin: 0;
          font-size: 18px;
        }

        .side-info {
          margin-bottom: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 7px;
          border-radius: 8px;
        }

        .side-info small {
          color: #6b7280;
          display: block;
          font-size: 9.5px;
          text-transform: uppercase;
          margin-bottom: 3px;
          font-weight: bold;
        }

        .side-info span {
          color: #06152b;
          font-weight: bold;
          font-size: 12.5px;
          word-break: break-word;
        }

        .barcode {
          height: 50px;
          background: repeating-linear-gradient(
            90deg,
            #06152b 0px,
            #06152b 3px,
            transparent 3px,
            transparent 7px,
            #06152b 7px,
            #06152b 10px,
            transparent 10px,
            transparent 15px
          );
          border-radius: 8px;
          margin-top: 10px;
          opacity: 0.75;
        }

        .ticket-number {
          margin-top: 6px;
          text-align: center;
          font-size: 10.5px;
          color: #334155;
          letter-spacing: 0.6px;
          font-weight: bold;
        }
      </style>
    </head>

    <body>
      <div class="print-page">
        ${boardingPass.outerHTML}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };

        window.onafterprint = function() {
          window.close();
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

function goDashboard() {
  window.location.href = "2dash.html";
}

function bookMore() {
  window.location.href = "3.0flight_select.html";
}