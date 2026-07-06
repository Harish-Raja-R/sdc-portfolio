/* ===================================================================
   HOME.JS — advanced scroll graphics, loaded only by index.html.
   Everything here is additive and defensive:
   - it never touches the hero pin math, pipeline scroll math, ticker,
     counters, or contact form logic that already live in script.js
   - every feature has a plain, fully-visible fallback if JS/observers
     aren't available, so the page never gets stuck "hidden"
=================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------------------------------------------------------------
     1. Word-split "mask" reveal for section headings
  --------------------------------------------------------------- */
  function splitWords(el) {
    if (!el || el.dataset.split === "done") return;
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((word, i) => {
      const mask = document.createElement("span");
      mask.className = "split-word";
      const inner = document.createElement("span");
      inner.className = "split-word-inner";
      inner.textContent = word;
      inner.style.transitionDelay = `${i * 55}ms`;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.split = "done";
  }

  const headingTargets = document.querySelectorAll("[data-reveal-heading]");
  if (headingTargets.length) {
    if ("IntersectionObserver" in window) {
      const headingObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            if (!prefersReducedMotion) splitWords(entry.target);
            entry.target.classList.add("is-revealed");
            headingObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.4, rootMargin: "0px 0px -60px 0px" },
      );
      headingTargets.forEach((el) => headingObserver.observe(el));
    } else {
      headingTargets.forEach((el) => el.classList.add("is-revealed"));
    }
  }

  /* ---------------------------------------------------------------
     2. Staggered reveal for card groups (gateway grid, metric strip)
  --------------------------------------------------------------- */
  function prepareStagger(selector) {
    const items = document.querySelectorAll(selector);
    items.forEach((item, i) => {
      item.classList.add("stagger-item");
      item.style.transitionDelay = `${i * 70}ms`;
    });
    return items;
  }

  const staggerGroups = [prepareStagger(".gateway-grid > a"), prepareStagger(".metric-strip > article")];

  if ("IntersectionObserver" in window) {
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          staggerObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );
    staggerGroups.forEach((group) => group.forEach((item) => staggerObserver.observe(item)));
  } else {
    staggerGroups.forEach((group) => group.forEach((item) => item.classList.add("is-visible")));
  }

  /* ---------------------------------------------------------------
     3. Gateway cards — cursor-follow spotlight + gentle 3D tilt
  --------------------------------------------------------------- */
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll(".gateway-grid a").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
        const rotateY = (x / rect.width - 0.5) * 10;
        const rotateX = (y / rect.height - 0.5) * -10;
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------------
     4. Subtle mouse parallax on the hero grid (depth, no conflicts
        with the scroll-driven pin math in script.js)
  --------------------------------------------------------------- */
  const heroGridEl = document.getElementById("heroGrid");
  if (heroGridEl && canHover && !prefersReducedMotion) {
    window.addEventListener(
      "mousemove",
      (event) => {
        const relX = event.clientX / window.innerWidth - 0.5;
        const relY = event.clientY / window.innerHeight - 0.5;
        heroGridEl.style.transform = `translate3d(${relX * -18}px, ${relY * -18}px, 0)`;
      },
      { passive: true },
    );
  }

  /* ---------------------------------------------------------------
     5. Custom cursor — dot + trailing ring (desktop, fine pointer)
  --------------------------------------------------------------- */
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");

  if (cursorDot && cursorRing && canHover && !prefersReducedMotion) {
    document.body.classList.add("has-custom-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;

    window.addEventListener(
      "mousemove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        cursorDot.style.left = `${targetX}px`;
        cursorDot.style.top = `${targetY}px`;
      },
      { passive: true },
    );

    (function trailRing() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(trailRing);
    })();

    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });

    window.addEventListener("mouseleave", () => {
      cursorDot.style.opacity = "0";
      cursorRing.style.opacity = "0";
    });
    window.addEventListener("mouseenter", () => {
      cursorDot.style.opacity = "";
      cursorRing.style.opacity = "";
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = "none";
    cursorRing.style.display = "none";
  }
})();
