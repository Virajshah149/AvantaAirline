document.addEventListener("DOMContentLoaded", () => {
  // === 1. Intersection Reveal Animation ===
  const revealElements = document.querySelectorAll(
    ".about-section, .features-section, .stats-section, .timeline-section, .team-section, .sustainability"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => {
    el.classList.add("reveal-hidden");
    observer.observe(el);
  });

  // === 2. Counter Animation for Stats ===
  const counters = document.querySelectorAll(".stat-box h3");

  const runCounter = (el) => {
    const target = parseInt(el.textContent.replace(/\D/g, ""));
    let count = 0;
    const speed = Math.floor(2000 / target);

    const update = () => {
      if (count < target) {
        count += Math.ceil(target / 100);
        el.textContent = target >= 1000000 ? `${Math.min(count, target) / 1000000}M+` : `${Math.min(count, target)}+`;
        setTimeout(update, speed);
      } else {
        el.textContent = el.dataset.final;
      }
    };
    update();
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((el) => {
    el.dataset.final = el.textContent;
    el.textContent = "0+";
    counterObserver.observe(el);
  });

  // === 3. Feature Card Glow (Optional Hover Effect) ===
  const featureCards = document.querySelectorAll(".feature-card");

  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = "0 0 25px rgba(0, 75, 141, 0.3)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
    });
  });
});
