document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:5000";

  const cancelForm = document.getElementById("cancelForm");
  const supportForm = document.getElementById("supportForm");

  const cancelMsg = document.getElementById("cancelMsg");
  const supportMsg = document.getElementById("supportMsg");

  const sendOtpBtn = document.getElementById("sendOtpBtn");

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", async () => {
      const ticketNumber = document.getElementById("ticketNumber").value.trim();
      const email = document.getElementById("cancelEmail").value.trim();

      if (!ticketNumber || !email) {
        cancelMsg.innerText = "Please enter Ticket Number and Email first.";
        cancelMsg.style.color = "red";
        return;
      }

      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = "Sending OTP...";

      try {
        const res = await fetch(`${API_BASE}/api/support/send-cancel-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ticketNumber: ticketNumber,
            email: email
          })
        });

        const data = await res.json();

        if (data.success === true) {
          cancelMsg.innerText = "OTP sent Successfully. Check server terminal for demo OTP.";
          cancelMsg.style.color = "green";
        } else {
          cancelMsg.innerText = data.message;
          cancelMsg.style.color = "red";
        }
      } catch (error) {
        console.log(error);
        cancelMsg.innerText = "Backend server error while sending OTP.";
        cancelMsg.style.color = "red";
      }

      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Send OTP";
    });
  }

  if (cancelForm) {
    cancelForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const ticketNumber = document.getElementById("ticketNumber").value.trim();
      const email = document.getElementById("cancelEmail").value.trim();
      const otp = document.getElementById("cancelOtp").value.trim();

      const submitButton = cancelForm.querySelector("button[type='submit']");

      if (!ticketNumber || !email || !otp) {
        cancelMsg.innerText = "Please fill Ticket Number, Email and OTP.";
        cancelMsg.style.color = "red";
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Cancelling...";

      try {
        const res = await fetch(`${API_BASE}/api/support/cancel-booking`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ticketNumber: ticketNumber,
            email: email,
            otp: otp
          })
        });

        const data = await res.json();

        if (data.success === true) {
          cancelMsg.innerText = data.message;
          cancelMsg.style.color = "green";
          cancelForm.reset();
        } else {
          cancelMsg.innerText = data.message;
          cancelMsg.style.color = "red";
        }
      } catch (error) {
        console.log(error);
        cancelMsg.innerText = "Backend server error. Please try again.";
        cancelMsg.style.color = "red";
      }

      submitButton.disabled = false;
      submitButton.textContent = "Cancel Flight";
    });
  }

  if (supportForm) {
    supportForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("supportName").value.trim();
      const email = document.getElementById("supportEmail").value.trim();
      const subject = document.getElementById("supportSubject").value.trim();
      const message = document.getElementById("supportMessage").value.trim();
      const submitButton = supportForm.querySelector("button");

      if (!name || !email || !subject || !message) {
        supportMsg.innerText = "Please fill all support request fields.";
        supportMsg.style.color = "red";
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      try {
        const res = await fetch(`${API_BASE}/api/support`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            email: email,
            subject: subject,
            message: message
          })
        });

        const data = await res.json();

        if (data.success === true) {
          supportMsg.innerText = "Support request submitted successfully!";
          supportMsg.style.color = "green";
          supportForm.reset();
        } else {
          supportMsg.innerText = data.message || "Support request failed.";
          supportMsg.style.color = "red";
        }
      } catch (error) {
        console.log(error);
        supportMsg.innerText = "Backend server error. Please try again.";
        supportMsg.style.color = "red";
      }

      submitButton.disabled = false;
      submitButton.textContent = "Submit Request";
    });
  }

  const faqs = document.querySelectorAll(".faq-list li");

  faqs.forEach(faq => {
    faq.style.cursor = "pointer";

    faq.addEventListener("click", () => {
      faq.classList.toggle("open");

      const span = faq.querySelector("span");

      if (span) {
        span.classList.toggle("visible");
      }
    });
  });
});