document.addEventListener("DOMContentLoaded", () => {
  const travelClass = document.getElementById("travelClass");
  const seatPosition = document.getElementById("seatPosition");
  const recliner = document.getElementById("recliner");
  const cabin = document.getElementById("cabin");
  const form = document.querySelector(".selection-form");

  const priceDisplay = document.createElement("div");
  priceDisplay.id = "priceDisplay";
  priceDisplay.style.marginTop = "10px";
  priceDisplay.style.fontSize = "1.1rem";
  priceDisplay.style.fontWeight = "600";
  priceDisplay.style.color = "#ffd700";

  form.appendChild(priceDisplay);

  function calculatePrice() {
    let basePrice = 2000;

    switch (travelClass.value) {
      case "first":
        basePrice += 4000;
        break;

      case "business":
        basePrice += 2500;
        break;

      case "economy":
        basePrice += 1000;
        break;
    }

    switch (seatPosition.value) {
      case "window":
        basePrice += 300;
        break;

      case "aisle":
        basePrice += 200;
        break;

      case "middle":
        basePrice += 100;
        break;
    }

    switch (recliner.value) {
      case "full":
        basePrice += 700;
        break;

      case "partial":
        basePrice += 400;
        break;

      case "none":
        basePrice += 0;
        break;
    }

    switch (cabin.value) {
      case "front":
        basePrice += 250;
        break;

      case "middle":
        basePrice += 100;
        break;

      case "rear":
        basePrice += 0;
        break;
    }

    priceDisplay.textContent = `Estimated Ticket Price: ₹${basePrice} + TAX`;

    return basePrice;
  }

  [travelClass, seatPosition, recliner, cabin].forEach(select => {
    select.addEventListener("change", calculatePrice);
  });

  calculatePrice();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const seatData = {
      travelClass: travelClass.value,
      seatPosition: seatPosition.value,
      recliner: recliner.value,
      cabin: cabin.value,
      seatNumber: generateSeatNumber(),
      price: calculatePrice()
    };

    localStorage.setItem("seatData", JSON.stringify(seatData));

    window.location.href = "3.2passenger_detail.html";
  });

  function generateSeatNumber() {
    const row = Math.floor(Math.random() * 25) + 1;
    const seats = ["A", "B", "C", "D", "E", "F"];
    const seat = seats[Math.floor(Math.random() * seats.length)];

    return row + seat;
  }
});