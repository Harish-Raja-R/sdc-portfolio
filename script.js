const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");
const heroGrid = document.getElementById("heroGrid");
const landingSpacer = document.getElementById("landingSpacer");
const heroFixed = document.getElementById("heroFixed");
const heroOrbit = document.getElementById("heroOrbit");
const heroTitleWrap = document.getElementById("heroTitleWrap");

function closeMenu() {
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuPanel.classList.remove("is-open");
  menuPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

function openMenu() {
  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuPanel.classList.add("is-open");
  menuPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
}

menuToggle.addEventListener("click", () => {
  if (menuPanel.classList.contains("is-open")) closeMenu();
  else openMenu();
});

document.querySelectorAll(".menu-panel a, .menu-pagination button").forEach((item) => {
  item.addEventListener("click", (event) => {
    const target = item.getAttribute("href") || item.dataset.target;
    closeMenu();
    if (target && target.startsWith("#")) {
      event.preventDefault();
      setTimeout(() => document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }), 180);
    }
  });
});

let cells = [];
let cellSize = 52;

function buildGrid() {
  if (!heroGrid) return;
  heroGrid.innerHTML = "";
  cells = [];
  cellSize = window.innerWidth < 720 ? 42 : 52;
  const cols = Math.ceil(window.innerWidth / cellSize) + 2;
  const rows = Math.ceil(window.innerHeight / cellSize) + 2;
  const offsetX = (window.innerWidth % cellSize) / 2 - cellSize;
  const offsetY = (window.innerHeight % cellSize) / 2 - cellSize;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = document.createElement("div");
      cell.className = "flash-cell";
      cell.style.width = `${cellSize + 1}px`;
      cell.style.height = `${cellSize + 1}px`;
      cell.style.left = `${offsetX + col * cellSize}px`;
      cell.style.top = `${offsetY + row * cellSize}px`;
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
  const travel = Math.max(1, rect.height - window.innerHeight);
  const progress = Math.max(0, Math.min(1, -rect.top / travel));
  const visibleRows = Math.ceil(window.innerHeight / cellSize);

  if (-rect.top > rect.height) {
    heroFixed.style.display = "none";
  } else {
    heroFixed.style.display = "flex";
  }

  let incoming = 0;
  let outgoing = 0;
  if (progress < 0.38) incoming = progress / 0.38;
  else if (progress < 0.66) incoming = 1;
  else {
    incoming = 1;
    outgoing = (progress - 0.66) / 0.34;
  }

  const orbitOpacity = progress < 0.58 ? 1 - Math.max(0, (progress - 0.28) / 0.3) : 0;
  const titleOpacity =
    progress < 0.32 ? 0 : progress < 0.58 ? (progress - 0.32) / 0.26 : Math.max(0, 1 - outgoing / 0.5);

  heroOrbit.style.opacity = Math.max(0, Math.min(1, orbitOpacity)).toString();
  heroOrbit.style.transform = `scale(${1 + progress * 0.24})`;
  heroTitleWrap.style.opacity = Math.max(0, Math.min(1, titleOpacity)).toString();

  const incomingLine = visibleRows + 1 - incoming * (visibleRows + 12);
  const outgoingLine = visibleRows + 3 - outgoing * (visibleRows + 14);

  cells.forEach((cell) => {
    const enterDistance = cell.row + cell.roughness * (1 - incoming) - incomingLine;
    const exitDistance = cell.row + cell.roughness * (1 - outgoing) - outgoingLine;
    let opacity = 0;

    if (enterDistance >= 0) opacity = 0.9;
    else if (enterDistance > -4) {
      const threshold = 0.9 - (Math.abs(enterDistance) - 1) * 0.22;
      if (cell.seed < threshold) opacity = 0.75 - (Math.abs(enterDistance) - 1) * 0.15;
    }

    if (exitDistance > 4) opacity = 0;
    else if (exitDistance > 0) {
      const fade = 1 - exitDistance / 4;
      opacity = Math.min(opacity, fade);
    }

    cell.element.style.opacity = Math.max(0, Math.min(0.9, opacity)).toString();
  });
}

window.addEventListener("resize", buildGrid);
window.addEventListener("scroll", updateHero, { passive: true });
buildGrid();
