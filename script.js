const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");
const heroGrid = document.getElementById("heroGrid");
const landingSpacer = document.getElementById("landingSpacer");
const heroFixed = document.getElementById("heroFixed");
const heroOrbit = document.getElementById("heroOrbit");
const heroTitleWrap = document.getElementById("heroTitleWrap");
const currentPage = window.location.pathname.split("/").pop() || "index.html";

function closeMenu() {
  if (!menuToggle || !menuPanel) return;

  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");

  menuPanel.classList.remove("is-open");
  menuPanel.setAttribute("aria-hidden", "true");

  document.body.classList.remove("menu-open");
}

function openMenu() {
  if (!menuToggle || !menuPanel) return;

  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");

  menuPanel.classList.add("is-open");
  menuPanel.setAttribute("aria-hidden", "false");

  document.body.classList.add("menu-open");
}

if (menuToggle && menuPanel) {
  menuToggle.addEventListener("click", () => {
    if (menuPanel.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

document
  .querySelectorAll(".menu-panel a, .menu-pagination button")
  .forEach((item) => {
    const target = item.getAttribute("href") || item.dataset.target;

    if (target === currentPage) {
      item.classList.add("is-current");

      if (item.tagName === "A") {
        item.setAttribute("aria-current", "page");
      }
    }

    item.addEventListener("click", (event) => {
      closeMenu();

      if (target && target.startsWith("#")) {
        event.preventDefault();

        setTimeout(() => {
          document
            .querySelector(target)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 180);

        return;
      }

      if (item.tagName === "BUTTON" && target) {
        event.preventDefault();

        setTimeout(() => {
          window.location.href = target;
        }, 180);
      }
    });
  });

if (menuPanel && !menuPanel.querySelector(".menu-links a.is-current")) {
  const fallbackTarget = "index.html";

  menuPanel
    .querySelectorAll(".menu-links a, .menu-pagination button")
    .forEach((item) => {
      item.classList.toggle(
        "is-current",
        (item.getAttribute("href") || item.dataset.target) === fallbackTarget,
      );
    });
}

const menuPreviewItems = [
  ...document.querySelectorAll(".menu-pagination button, .menu-links a"),
];

function getMenuTarget(item) {
  return item.getAttribute("href") || item.dataset.target;
}

function setMenuPreview(target) {
  if (!menuPanel || !target) return;

  menuPanel.classList.add("has-preview");

  menuPreviewItems.forEach((item) => {
    item.classList.toggle("is-preview", getMenuTarget(item) === target);
  });
}

function clearMenuPreview() {
  if (!menuPanel) return;

  menuPanel.classList.remove("has-preview");
  menuPreviewItems.forEach((item) => item.classList.remove("is-preview"));
}

if (menuPanel && menuPreviewItems.length) {
  menuPreviewItems.forEach((item) => {
    const target = getMenuTarget(item);

    item.addEventListener("pointerenter", () => setMenuPreview(target));
    item.addEventListener("mouseover", () => setMenuPreview(target));
    item.addEventListener("mouseenter", () => setMenuPreview(target));
    item.addEventListener("focus", () => setMenuPreview(target));
  });

  menuPanel.addEventListener("pointerleave", clearMenuPreview);
  menuPanel.addEventListener("mouseleave", clearMenuPreview);
  menuPanel.addEventListener("focusout", (event) => {
    if (!menuPanel.contains(event.relatedTarget)) {
      clearMenuPreview();
    }
  });
}

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -42px 0px",
        },
      )
    : null;

document.querySelectorAll(".reveal").forEach((element) => {
  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    element.classList.add("is-visible");
  }
});

/* =========================================================
   CONTACT FORM
   ========================================================= */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const interest = String(formData.get("interest") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const status = contactForm.querySelector(".form-status");

    if (!name || !email || !interest || !message) {
      if (status) {
        status.textContent =
          "Complete every field before launching the message.";
      }

      return;
    }

    const subject = encodeURIComponent(`SDC enquiry from ${name}`);

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\nMessage:\n${message}`,
    );

    if (status) {
      status.textContent =
        "Opening your mail app with the message prepared.";
    }

    window.location.href =
      `mailto:sdc@cit.edu.in?subject=${subject}&body=${body}`;
  });
}

/* =========================================================
   HERO GRID ANIMATION
   ========================================================= */

let cells = [];
let cellSize = 52;

function buildGrid() {
  if (!heroGrid) return;

  heroGrid.innerHTML = "";

  cells = [];

  cellSize = window.innerWidth < 720 ? 42 : 52;

  const cols = Math.ceil(window.innerWidth / cellSize) + 2;
  const rows = Math.ceil(window.innerHeight / cellSize) + 2;

  const offsetX =
    (window.innerWidth % cellSize) / 2 - cellSize;

  const offsetY =
    (window.innerHeight % cellSize) / 2 - cellSize;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = document.createElement("div");

      cell.className = "flash-cell";

      cell.style.width = `${cellSize + 1}px`;
      cell.style.height = `${cellSize + 1}px`;

      cell.style.left =
        `${offsetX + col * cellSize}px`;

      cell.style.top =
        `${offsetY + row * cellSize}px`;

      heroGrid.appendChild(cell);

      cells.push({
        element: cell,
        row,
        seed: Math.random(),
        roughness: (Math.random() - 0.5) * 4,
      });
    }
  }

  updateHero();
}

function updateHero() {
  if (!landingSpacer || !cells.length) return;

  const rect = landingSpacer.getBoundingClientRect();

  const travel = Math.max(
    1,
    rect.height - window.innerHeight,
  );

  const progress = Math.max(
    0,
    Math.min(1, -rect.top / travel),
  );

  const visibleRows = Math.ceil(
    window.innerHeight / cellSize,
  );

  if (-rect.top > rect.height) {
    if (heroFixed) {
      heroFixed.style.display = "none";
    }
  } else {
    if (heroFixed) {
      heroFixed.style.display = "flex";
    }
  }

  let incoming = 0;
  let outgoing = 0;

  if (progress < 0.38) {
    incoming = progress / 0.38;
  } else if (progress < 0.66) {
    incoming = 1;
  } else {
    incoming = 1;
    outgoing = (progress - 0.66) / 0.34;
  }

  const orbitOpacity =
    progress < 0.58
      ? 1 - Math.max(0, (progress - 0.28) / 0.3)
      : 0;

  const titleOpacity =
    progress < 0.32
      ? 0
      : progress < 0.58
        ? (progress - 0.32) / 0.26
        : Math.max(0, 1 - outgoing / 0.5);

  if (heroOrbit) {
    heroOrbit.style.opacity = Math.max(
      0,
      Math.min(1, orbitOpacity),
    ).toString();

    heroOrbit.style.transform =
      `scale(${1 + progress * 0.24})`;
  }

  if (heroTitleWrap) {
    heroTitleWrap.style.opacity = Math.max(
      0,
      Math.min(1, titleOpacity),
    ).toString();
  }

  const incomingLine =
    visibleRows +
    1 -
    incoming * (visibleRows + 12);

  const outgoingLine =
    visibleRows +
    3 -
    outgoing * (visibleRows + 14);

  cells.forEach((cell) => {
    const enterDistance =
      cell.row +
      cell.roughness * (1 - incoming) -
      incomingLine;

    const exitDistance =
      cell.row +
      cell.roughness * (1 - outgoing) -
      outgoingLine;

    let opacity = 0;

    if (enterDistance >= 0) {
      opacity = 0.9;
    } else if (enterDistance > -4) {
      const threshold =
        0.9 -
        (Math.abs(enterDistance) - 1) * 0.22;

      if (cell.seed < threshold) {
        opacity =
          0.75 -
          (Math.abs(enterDistance) - 1) * 0.15;
      }
    }

    if (exitDistance > 4) {
      opacity = 0;
    } else if (exitDistance > 0) {
      const fade = 1 - exitDistance / 4;
      opacity = Math.min(opacity, fade);
    }

    cell.element.style.opacity = Math.max(
      0,
      Math.min(0.9, opacity),
    ).toString();
  });
}

window.addEventListener("resize", buildGrid);

window.addEventListener(
  "scroll",
  updateHero,
  { passive: true },
);

buildGrid();

