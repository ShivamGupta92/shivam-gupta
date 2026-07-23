(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      navLinks.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById("progress-bar");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-spy ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const linkFor = (id) => document.querySelector(`.nav-links a[href="#${id}"]`);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = linkFor(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll(".nav-links a.active").forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-35% 0px -60% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Staggered reveal on scroll ---------- */
  const revealer = new IntersectionObserver(
    (entries) => {
      // stagger only among elements entering in the same batch
      let i = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--d", `${Math.min(i * 0.08, 0.4)}s`);
        entry.target.classList.add("visible");
        revealer.unobserve(entry.target);
        i++;
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- Hero terminal typing ---------- */
  const termBody = document.getElementById("term-body");

  // [cssClass, text, charDelayMs]
  const SCRIPT = [
    ["t-prompt", "shivam@production", 0], ["t-cmd", " $ ", 0], ["t-cmd", "whoami", 28], ["", "\n", 0],
    ["t-out", "AI engineer — LLM · RAG · voice systems", 8], ["", "\n", 0],
    ["t-prompt", "shivam@production", 0], ["t-cmd", " $ ", 0], ["t-cmd", "deploy expertly-voice --to prod", 24], ["", "\n", 0],
    ["t-out", "serving real clients · with concurrent calls ", 8], ["t-ok", "✓", 0], ["", "\n", 0],
    ["t-out", "latency: 7-8s → <900ms ", 8], ["t-ok", "✓", 0], ["", "\n", 0],
    ["t-prompt", "shivam@production", 0], ["t-cmd", " $ ", 0], ["t-cmd", "eval synapse --metric recall@5", 24], ["", "\n", 0],
    ["t-out", "0.40 → 0.90 · hybrid retrieval + reranking ", 8], ["t-ok", "✓", 0], ["", "\n", 0],
    ["t-prompt", "shivam@production", 0], ["t-cmd", " $ ", 0], ["t-cmd", "ls publications/", 24], ["", "\n", 0],
    ["t-out", "ieee-2024  ieee-2024  springer-2026  +1-in-press", 8], ["", "\n", 0],
    ["t-prompt", "shivam@production", 0], ["t-cmd", " $ ", 0],
  ];

  const cursor = document.createElement("span");
  cursor.className = "t-cursor";

  function typeScript() {
    if (reducedMotion) {
      // render instantly
      SCRIPT.forEach(([cls, text]) => {
        const span = document.createElement("span");
        if (cls) span.className = cls;
        span.textContent = text;
        termBody.appendChild(span);
      });
      termBody.appendChild(cursor);
      return;
    }

    let seg = 0, ch = 0;
    let current = null;
    termBody.appendChild(cursor);

    (function tick() {
      if (seg >= SCRIPT.length) return;
      const [cls, text, delay] = SCRIPT[seg];

      if (!current) {
        current = document.createElement("span");
        if (cls) current.className = cls;
        termBody.insertBefore(current, cursor);
      }

      if (delay === 0) {
        current.textContent = text;
        ch = text.length;
      } else {
        ch++;
        current.textContent = text.slice(0, ch);
      }

      if (ch >= text.length) {
        seg++; ch = 0; current = null;
        setTimeout(tick, text === "\n" ? 90 : 30);
      } else {
        setTimeout(tick, delay);
      }
    })();
  }

  // start typing when the terminal scrolls into view (it's above the fold, so usually immediately)
  const termObserver = new IntersectionObserver((entries, obs) => {
    if (entries.some((e) => e.isIntersecting)) {
      obs.disconnect();
      setTimeout(typeScript, 400);
    }
  });
  termObserver.observe(termBody);

  /* ---------- Certificate lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");

  document.querySelectorAll(".cert-zoom").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      lightboxImg.src = a.getAttribute("href");
      lightbox.showModal();
    });
  });
  document.getElementById("lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Contact form (Google Apps Script backend) ---------- */
  const ACTION =
    "https://script.google.com/macros/s/AKfycbxITdweM4ReGodmudKFNx4sFpvhS4sRyVaLzRPMqdp9muNQWk6RykOEKw5YshnQ9AQ/exec";

  const form = document.querySelector(".contactMeForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const loading = form.querySelector(".loading");
    const errorBox = form.querySelector(".error-message");
    const sentBox = form.querySelector(".sent-message");

    loading.classList.add("d-block");
    errorBox.classList.remove("d-block");
    sentBox.classList.remove("d-block");

    fetch(ACTION, { method: "POST", body: new FormData(form) })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        loading.classList.remove("d-block");
        if (data.result === "success") {
          sentBox.classList.add("d-block");
          form.reset();
        } else {
          throw new Error(data.result || "Form submission failed.");
        }
      })
      .catch((error) => {
        loading.classList.remove("d-block");
        errorBox.textContent = "Couldn't send — please email me directly. (" + error.message + ")";
        errorBox.classList.add("d-block");
      });
  });
})();
