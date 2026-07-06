document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("flightForm");
  const from = document.getElementById("from");
  const to = document.getElementById("to");
  const date = document.getElementById("date");
  const results = document.getElementById("results");

  const API_BASE = "http://localhost:5000";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    results.innerHTML = "";

    if (!from.value || !to.value || !date.value) {
      results.innerHTML = `<p class="error">Please fill in all fields to search flights.</p>`;
      return;
    }

    if (from.value === to.value) {
      results.innerHTML = `<p class="error">Departure and destination cannot be the same.</p>`;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/flights`);
      const data = await res.json();

      const flights = data.flights;

      localStorage.setItem("from", from.value);
      localStorage.setItem("to", to.value);
      localStorage.setItem("date", date.value);

      const list = document.createElement("div");
      list.className = "result-box";

      const flightForm = document.createElement("form");
      flightForm.id = "flightSelectForm";
      flightForm.innerHTML = `<h3>Available Flights</h3>`;

      flights.forEach(flight => {
        const label = document.createElement("label");
        label.className = "flight-option";

        label.innerHTML = `
          <input 
            type="radio" 
            name="flight" 
            value="${flight.id}"
            data-name="${flight.name}"
            data-number="${flight.flightNumber}"
            data-time="${flight.time}"
          >
          <span>
            <strong>${flight.name}</strong> - ${flight.flightNumber} - ${flight.time}
          </span>
        `;

        flightForm.appendChild(label);
      });

      const seatBtn = document.createElement("button");
      seatBtn.type = "submit";
      seatBtn.id = "seatBtn";
      seatBtn.textContent = "Select Seat";
      seatBtn.disabled = true;

      flightForm.appendChild(seatBtn);
      list.appendChild(flightForm);
      results.appendChild(list);

      flightForm.addEventListener("change", () => {
        const selected = flightForm.querySelector("input[name='flight']:checked");
        seatBtn.disabled = !selected;
      });

      flightForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const selectedFlight = flightForm.querySelector("input[name='flight']:checked");

        if (selectedFlight) {
          const flightData = {
            id: selectedFlight.value,
            name: selectedFlight.dataset.name,
            flightNumber: selectedFlight.dataset.number,
            time: selectedFlight.dataset.time
          };

          localStorage.setItem("selectedFlight", JSON.stringify(flightData));

          window.location.href = "3.1.html";
        }
      });

    } catch (error) {
      results.innerHTML = `<p class="error">Backend server not running. Please start node server.js</p>`;
      console.log(error);
    }
  });

  const toggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  if (toggleBtn) {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      body.classList.add("dark");
      toggleBtn.textContent = "☀️";
    }

    toggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark");

      const isDark = body.classList.contains("dark");

      localStorage.setItem("theme", isDark ? "dark" : "light");
      toggleBtn.textContent = isDark ? "☀️" : "🌙";
    });
  }
});