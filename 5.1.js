document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://localhost:5000";

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const flyerInput = document.getElementById("flyer");
  const mealSelect = document.getElementById("meal");
  const seatSelect = document.getElementById("seat");
  const notificationsSelect = document.getElementById("notifications");
  const form = document.querySelector(".edit-form");

  const username = localStorage.getItem("username");

  if (!username) {
    alert("Please login first");
    window.location.href = "1login.html";
    return;
  }

  // Load current user data
  try {
    const res = await fetch(`${API_BASE}/api/profile/${username}`);
    const data = await res.json();

    if (data.success === true && data.user) {
      const user = data.user;

      nameInput.value = user.name || "";
      emailInput.value = user.email || "";
      phoneInput.value = user.phone || "";
      flyerInput.value = user.flyer || "AV1234567";
      mealSelect.value = user.meal || "Vegetarian";
      seatSelect.value = user.seat || "Aisle";
      notificationsSelect.value = user.notifications ? "Enabled" : "Disabled";
    }
  } catch (error) {
    console.error("Profile load error:", error);
    alert("Unable to load profile data");
  }

  // Save updated user data
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedUser = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      flyer: flyerInput.value.trim(),
      meal: mealSelect.value,
      seat: seatSelect.value,
      notifications: notificationsSelect.value === "Enabled"
    };

    if (!updatedUser.name || !updatedUser.email || !updatedUser.phone) {
      alert("Please fill name, email and phone");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/profile/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
      });

      const data = await res.json();

      if (data.success === true) {
        alert("Profile updated successfully!");

        localStorage.setItem("name", data.user.name);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("phone", data.user.phone);

        window.location.href = "5.0.html";
      } else {
        alert(data.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Backend error while updating profile");
    }
  });
});