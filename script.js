/* =========================================================
   SDC Site — Core Script
   ========================================================= */

const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");
const heroGrid = document.getElementById("heroGrid");
const landingSpacer = document.getElementById("landingSpacer");
const heroFixed = document.getElementById("heroFixed");
const heroOrbit = document.getElementById("heroOrbit");
const heroTitleWrap = document.getElementById("heroTitleWrap");
const currentPage = window.location.pathname.split("/").pop() || "index.html";

/* =========================================================
   Menu — Full screen with page preview in center
   ========================================================= */

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
    if (menuPanel.classList.contains("is-open")) closeMenu();
    else openMenu();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// Menu pagination — hovering a tab updates center preview
const menuPages = [
  { label: "HOME", num: "01", target: "index.html" },
  { label: "ABOUT", num: "02", target: "about.html" },
  { label: "EVENTS", num: "03", target: "events.html" },
  { label: "BLOGS", num: "04", target: "blogs.html" },
  { label: "TEAM", num: "05", target: "team.html" },
  { label: "CONTACT", num: "06", target: "contact.html" },
];

const menuCenter = document.getElementById("menuCenter");
const menuCenterNum = document.getElementById("menuCenterNum");
const menuCenterLabel = document.getElementById("menuCenterLabel");

document.querySelectorAll(".menu-pagination button").forEach((btn) => {
  const target = btn.dataset.target;
  const page = menuPages.find((p) => p.target === target);

  if (target === currentPage) btn.classList.add("is-current");

  btn.addEventListener("mouseenter", () => {
    if (menuCenterNum && page) menuCenterNum.textContent = page.num;
    if (menuCenterLabel && page) menuCenterLabel.textContent = page.label;
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    closeMenu();
    setTimeout(() => { window.location.href = target; }, 200);
  });
});

// Set initial center to current page
(function () {
  const cur = menuPages.find((p) => p.target === currentPage);
  if (cur && menuCenterNum) menuCenterNum.textContent = cur.num;
  if (cur && menuCenterLabel) menuCenterLabel.textContent = cur.label;
})();

// Center label click navigates
if (menuCenter) {
  menuCenter.addEventListener("click", () => {
    const label = menuCenterLabel?.textContent;
    const page = menuPages.find((p) => p.label === label);
    if (page) {
      closeMenu();
      setTimeout(() => { window.location.href = page.target; }, 200);
    }
  });
}

/* =========================================================
   Scroll Reveal
   ========================================================= */

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -42px 0px" },
    )
  : null;

document.querySelectorAll(".reveal").forEach((el) => {
  if (revealObserver) revealObserver.observe(el);
  else el.classList.add("is-visible");
});

/* =========================================================
   Contact Form
   ========================================================= */

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fd = new FormData(contactForm);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const interest = String(fd.get("interest") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const status = contactForm.querySelector(".form-status");

    if (!name || !email || !interest || !message) {
      if (status) status.textContent = "Fill in all fields.";
      return;
    }
    const subject = encodeURIComponent(`SDC enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`);
    if (status) status.textContent = "Opening your mail app...";
    window.location.href = `mailto:sdc@citchennai.net?subject=${subject}&body=${body}`;
  });
}

/* =========================================================
   Hero Grid Animation (home page)
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
  const offsetX = (window.innerWidth % cellSize) / 2 - cellSize;
  const offsetY = (window.innerHeight % cellSize) / 2 - cellSize;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.className = "flash-cell";
      cell.style.width = `${cellSize + 1}px`;
      cell.style.height = `${cellSize + 1}px`;
      cell.style.left = `${offsetX + col * cellSize}px`;
      cell.style.top = `${offsetY + row * cellSize}px`;
      // Start partially visible so there's no black void
      cell.style.opacity = (0.3 + Math.random() * 0.25).toFixed(2);
      heroGrid.appendChild(cell);
      cells.push({ element: cell, row, seed: Math.random(), roughness: (Math.random() - 0.5) * 4 });
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

  if (-rect.top > rect.height) { if (heroFixed) heroFixed.style.display = "none"; }
  else { if (heroFixed) heroFixed.style.display = "flex"; }

  let incoming = 0, outgoing = 0;
  if (progress < 0.38) incoming = progress / 0.38;
  else if (progress < 0.66) incoming = 1;
  else { incoming = 1; outgoing = (progress - 0.66) / 0.34; }

  const orbitOpacity = progress < 0.58 ? 1 - Math.max(0, (progress - 0.28) / 0.3) : 0;
  const titleOpacity = progress < 0.32 ? 0 : progress < 0.58 ? (progress - 0.32) / 0.26 : Math.max(0, 1 - outgoing / 0.5);

  if (heroOrbit) { heroOrbit.style.opacity = Math.max(0, Math.min(1, orbitOpacity)); heroOrbit.style.transform = `scale(${1 + progress * 0.24})`; }
  if (heroTitleWrap) { heroTitleWrap.style.opacity = Math.max(0, Math.min(1, titleOpacity)); }

  const incomingLine = visibleRows + 1 - incoming * (visibleRows + 12);
  const outgoingLine = visibleRows + 3 - outgoing * (visibleRows + 14);

  cells.forEach((cell) => {
    const enterDist = cell.row + cell.roughness * (1 - incoming) - incomingLine;
    const exitDist = cell.row + cell.roughness * (1 - outgoing) - outgoingLine;
    let opacity = 0;
    if (enterDist >= 0) opacity = 0.9;
    else if (enterDist > -4) {
      const threshold = 0.9 - (Math.abs(enterDist) - 1) * 0.22;
      if (cell.seed < threshold) opacity = 0.75 - (Math.abs(enterDist) - 1) * 0.15;
    }
    if (exitDist > 4) opacity = 0;
    else if (exitDist > 0) opacity = Math.min(opacity, 1 - exitDist / 4);
    cell.element.style.opacity = Math.max(0, Math.min(0.9, opacity));
  });
}

window.addEventListener("resize", buildGrid);
window.addEventListener("scroll", updateHero, { passive: true });
buildGrid();


/* =========================================================
   SDC_TEAM Data
   ========================================================= */

const SDC_TEAM = [
  { id: "SDC-25-26-001", slug: "theebikasri-jagadees", name: "Theebikasri Jagadees", role: "Executive Director", program: "MSc AI&ML, 3rd Yr", division: "Executive Directors", avatar: "https://lh3.googleusercontent.com/d/11ptnl9KQ8kYWt69IprD6NfToQKdeZ_GH=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/theebikasri-jagadees-b6b597321" }, { label: "Instagram", href: "https://www.instagram.com/theebikasri.j" }] },
  { id: "SDC-25-26-002", slug: "shane-israel", name: "Shane Israel", role: "Executive Director", program: "MSc AI&ML, 3rd Yr", division: "Executive Directors", avatar: "https://lh3.googleusercontent.com/d/1Zxk0cJxMs5nx4L-NeNB0uwBBj7QYjOPJ=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/shane-israel/" }, { label: "Instagram", href: "https://www.instagram.com/_shane__israel_lh44_/" }] },
  { id: "SDC-25-26-003", slug: "madhumitha-n", name: "Madhumitha N", role: "Chief Architect", program: "MSc AI&ML, 4th Yr", division: "Chief Architects", avatar: "https://sdccit.vercel.app/assets/img/members25-26/MADHUMITHA.jpg", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/madhumitha-n-2526362a6" }, { label: "Instagram", href: "https://www.instagram.com/_.madhu._n" }] },
  { id: "SDC-25-26-004", slug: "nikhil-s-s", name: "Nikhil S S", role: "Chief Architect", program: "BE ECE, 4th Yr", division: "Chief Architects", avatar: "https://sdccit.vercel.app/assets/img/members25-26/Nikhil.jpg", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/nikhil-s-s-2005official" }, { label: "Instagram", href: "https://www.instagram.com/nikhil._.s.s" }] },
  { id: "SDC-25-26-005", slug: "jeydarsana-j", name: "Jeydarsana J", role: "Associate Director", program: "MSc DCS, 3rd Yr", division: "Associate Directors", avatar: "https://lh3.googleusercontent.com/d/1vjGPIeSZOl4Q-APdAbkQxSS5vo5obCCt=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/jeydarsana-j-994505329" }, { label: "Instagram", href: "https://www.instagram.com/__jd___06" }] },
  { id: "SDC-25-26-006", slug: "kalaiselvan-k", name: "Kalaiselvan K", role: "Associate Director", program: "MSc AI&ML, 3rd Yr", division: "Associate Directors", avatar: "https://lh3.googleusercontent.com/d/1WjcNKoYHHGtD-7sY2mNrpzCAdSEiq-Hh=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/kalaiselvan-k-3871912a7" }, { label: "Instagram", href: "https://www.instagram.com/k_kalaiselvan_" }] },
  { id: "SDC-25-26-007", slug: "nesika-saravanan", name: "Nesika Saravanan", role: "Treasurer", program: "MSc SS, 3rd Yr", division: "Treasurers", avatar: "https://lh3.googleusercontent.com/d/133GGALqIbZOwcjSMJbjkg9IfQ90Ovdaz=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/nesika-saravanan-261981339" }, { label: "Instagram", href: "https://www.instagram.com/__.nesika.__" }] },
  { id: "SDC-25-26-008", slug: "nithish-venkat", name: "Nithish Venkat", role: "Treasurer", program: "MSc AI&ML, 3rd Yr", division: "Treasurers", avatar: "https://lh3.googleusercontent.com/d/1kGRbGLHTDO1W3hxIXILfNOxIrqcgnArf=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/nithish-venkat-4756442b4" }, { label: "Instagram", href: "https://www.instagram.com/freak.nx4" }] },
  { id: "SDC-25-26-009", slug: "lakshana-ramesh", name: "Lakshana Ramesh", role: "External Affairs", program: "MSc AI&ML, 3rd Yr", division: "External Affairs Lead", avatar: "https://lh3.googleusercontent.com/d/1nYLQjlJe4Tev3ciy22j-lvFMfFtCmOKy=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/lakshana-ramesh-04b84b320" }, { label: "Instagram", href: "https://www.instagram.com/_lakshana_ramesh06" }] },
  { id: "SDC-25-26-010", slug: "ananthika-c", name: "Ananthika C.", role: "Technical Management Lead", program: "MSc AI&ML, 3rd Yr", division: "Heads of Technical Management", avatar: "https://lh3.googleusercontent.com/d/10W1kn1dg0gd0nG1Kt34gooKj73gPZ_vh=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/ananthika-c-7996a3320" }, { label: "Instagram", href: "https://www.instagram.com/antarcticx._" }] },
  { id: "SDC-25-26-011", slug: "harish-raja-r", name: "Harish Raja R", role: "Technical Management Lead", program: "MSc AI&ML, 3rd Yr", division: "Heads of Technical Management", avatar: "https://lh3.googleusercontent.com/d/1ym0614ueasHHI-2fLJVYgEbVZ-GTTJ0A=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/harish-raja-r" }, { label: "Instagram", href: "https://www.instagram.com/harish.weirdo" }] },
  { id: "SDC-25-26-012", slug: "vijayaganth-kathiresan", name: "Vijayaganth Kathiresan", role: "Technical Consultant", program: "MSc AI&ML, 2nd Yr", division: "Technical Consultants", avatar: "https://lh3.googleusercontent.com/d/1PEvoFauuIN8v5thTEoVx6WFyhBrfq7z7=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/vijayaganth-k-verified-b20406375" }, { label: "Instagram", href: "https://www.instagram.com/sdc_cit/" }] },
  { id: "SDC-25-26-013", slug: "shri-sundaram", name: "Shri Sundaram", role: "Technical Consultant", program: "BE ECE, 2nd Yr", division: "Technical Consultants", avatar: "https://lh3.googleusercontent.com/d/1zQ34kIGpXhiesWgD989lNm35Q4VVHnAZ=w1000", socials: [{ label: "LinkedIn", href: "https://linkedin.com/in/shri-sundaram-2b2bb5383" }, { label: "Instagram", href: "https://www.instagram.com/sdc_cit/" }] },
  { id: "SDC-25-26-014", slug: "hayakreev-raja", name: "Hayakreev Raja", role: "Technical Consultant", program: "MSc AI&ML, 2nd Yr", division: "Technical Consultants", avatar: "https://lh3.googleusercontent.com/d/16XWeK4HalQzaU8A6aExqSRB-sg8yN41i=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/hayakreev-raja-a54508395" }, { label: "Instagram", href: "https://www.instagram.com/hayak_015" }] },
  { id: "SDC-25-26-015", slug: "adhidev-s", name: "Adhidev S", role: "Technical Consultant", program: "MSc SS, 2nd Yr", division: "Technical Consultants", avatar: "https://lh3.googleusercontent.com/d/1jZu6GHYhguXZRFwET-uI9ld02Ujc9pfE=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/company/sdc-cit/" }, { label: "Instagram", href: "https://www.instagram.com/adhidev_02" }] },
  { id: "SDC-25-26-016", slug: "bhuvanesh-a", name: "Bhuvanesh A", role: "Technical Consultant", program: "MSc AI&ML, 2nd Yr", division: "Technical Consultants", avatar: "https://lh3.googleusercontent.com/d/11aJ_Z7gMlL-7bvqR8NnS_X98-YxKiLSH=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/bhuvanesh-a-16321b320" }, { label: "Instagram", href: "https://www.instagram.com/_.bhuvanesh._10_" }] },
  { id: "SDC-25-26-017", slug: "dharshini-s", name: "Dharshini S", role: "Technical Consultant", program: "MSc AI&ML, 2nd Yr", division: "Technical Consultants", avatar: "https://lh3.googleusercontent.com/d/1GIZzw-tqlZETR2hxdCWJ9fF8_xt-QuAV=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/dharshini-s-526a52375" }, { label: "Instagram", href: "https://www.instagram.com/_d.h.a.r.s.h.in.i_" }] },
  { id: "SDC-25-26-018", slug: "adhiya-rangaraj", name: "Adhiya Rangaraj", role: "Head of Public Relations", program: "MSc AI&ML, 3rd Yr", division: "Head of Public Relations", avatar: "https://lh3.googleusercontent.com/d/1zkbqcBzfJXBC3H1IbQuwLoaUuozA2qDW=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/adhiya-rangaraj-a3429a302/" }, { label: "Instagram", href: "https://www.instagram.com/sdc_cit/" }] },
  { id: "SDC-25-26-019", slug: "saadhia-h", name: "Saadhia H", role: "Public Relations Team", program: "BE CSE, 2nd Yr", division: "The Public Relations Team", avatar: "https://lh3.googleusercontent.com/d/1Cnqfrxe5NkxwfKmQbZyJqRklaJbfqfhY=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/saadhia-h-1b5990384" }, { label: "Instagram", href: "https://www.instagram.com/sdc_cit/" }] },
  { id: "SDC-25-26-020", slug: "ashwanth-s", name: "Ashwanth S", role: "Public Relations Team", program: "BE CSE, 2nd Yr", division: "The Public Relations Team", avatar: "https://lh3.googleusercontent.com/d/1IYpiMI33XI350n6fOJk-Np5TADHo2sr3=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/ashwanth-s-3ab75737a" }, { label: "Instagram", href: "https://www.instagram.com/ashwanth7704" }] },
  { id: "SDC-25-26-021", slug: "ashwina-jayakrishnan", name: "Ashwina Jayakrishnan", role: "Public Relations Team", program: "MSc AI&ML, 2nd Yr", division: "The Public Relations Team", avatar: "https://lh3.googleusercontent.com/d/1fJH3mzkRuXOPYmI5Fb1Gch3qM-mo0u6r=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/ashwina-jayakrishnan-00b783355" }, { label: "Instagram", href: "https://www.instagram.com/ashhwee_.__" }] },
  { id: "SDC-25-26-022", slug: "samiksha-muthukumar", name: "Samiksha Muthukumar", role: "Head of Design", program: "MSc AI&ML, 3rd Yr", division: "Head of Design", avatar: "https://lh3.googleusercontent.com/d/1qIuNry87uZpu3e_Gmvc9n4xuXaxLgLYG=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/samiksha-muthukumar-499b60320/" }, { label: "Instagram", href: "https://www.instagram.com/unique__grl__25/" }] },
  { id: "SDC-25-26-023", slug: "rochana-r", name: "Rochana R", role: "Designer", program: "MSc AI&ML, 2nd Yr", division: "Designers", avatar: "https://lh3.googleusercontent.com/d/10_br9f425vV6QRvaBTn3OXJvHT0yWRnw=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/rochana-r-419a8b388" }, { label: "Instagram", href: "https://www.instagram.com/_.sugarrrr" }] },
  { id: "SDC-25-26-024", slug: "charan-sekar", name: "Charan Sekar", role: "Designer", program: "MSc DS, 2nd Yr", division: "Designers", avatar: "https://lh3.googleusercontent.com/d/1cs0rVSCNSXHSGefBsCWjQDMakJTpVg45=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/charan-sekar-4670a0381" }, { label: "Instagram", href: "https://www.instagram.com/l_cy_offl" }] },
  { id: "SDC-25-26-025", slug: "rithika-m", name: "Rithika M", role: "Designer", program: "MSc AI&ML, 2nd Yr", division: "Designers", avatar: "https://lh3.googleusercontent.com/d/1qwdAmjPaQaN_NT9BUT7XQlw4-51pzcuv=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/rithika-m-a797783bb" }, { label: "Instagram", href: "https://www.instagram.com/rithikamohan_" }] },
  { id: "SDC-25-26-026", slug: "lathikka-ma", name: "Lathikka MA", role: "Program Management Lead", program: "MSc DS, 3rd Yr", division: "Head of Program Management", avatar: "https://lh3.googleusercontent.com/d/1c0aNqgU7yh3rXeaRGMxNtsqilW2rqKY7=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/lathikka-ma-cit" }, { label: "Instagram", href: "https://www.instagram.com/lathikkkaa" }] },
  { id: "SDC-25-26-027", slug: "janani-sree", name: "Janani Sree", role: "Program Manager", program: "MSc AI&ML, 2nd Yr", division: "The Program Managers", avatar: "https://lh3.googleusercontent.com/d/1fU5aTdG5YEvr58z7z4ZrXVTo2wpFEy6v=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/janani-sree-6a6491372" }, { label: "Instagram", href: "https://www.instagram.com/jananisreep" }] },
  { id: "SDC-25-26-028", slug: "aakash-balasubramani", name: "Aakash Balasubramani", role: "Program Manager", program: "MSc AI&ML, 3rd Yr", division: "The Program Managers", avatar: "https://lh3.googleusercontent.com/d/1jCzDOgGM2SKch3ypjJT4Oo3NH-Xqvfqu=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/aakash-balasubramani-994b47320" }, { label: "Instagram", href: "https://www.instagram.com/_.aakash.b._" }] },
  { id: "SDC-25-26-029", slug: "keerthana-venkatachalam", name: "Keerthana Venkatachalam", role: "Program Manager", program: "MSc AI&ML, 3rd Yr", division: "The Program Managers", avatar: "https://lh3.googleusercontent.com/d/1YFtp8tx--dBy2QGpO78Hhf-ZQYPbUn-3=w1000", socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/keerthana-venkatachalam-340394320" }, { label: "Instagram", href: "https://www.instagram.com/_.keerthh.__" }] },
  { id: "SDC-25-26-030", slug: "dr-d-k-kavitha", name: "Dr D.K. Kavitha", role: "Staff Advisor", program: "CIT Faculty", division: "Staff Advisors", avatar: "https://lh3.googleusercontent.com/d/1ANBuN1TqFKojC5ofZhutTpXsXrlO569z=w1000", noIdCard: true, socials: [{ label: "View Profile", href: "https://cit.edu.in/faculty/dr-d-kavitha" }] },
  { id: "SDC-25-26-031", slug: "dr-r-sudha-muthusamy", name: "Dr R. Sudha Muthusamy", role: "Staff Advisor", program: "CIT Faculty", division: "Staff Advisors", avatar: "https://lh3.googleusercontent.com/d/1E5ODHmwA7xNL3lp3u79jWj2qeFIMpjrk=w1000", noIdCard: true, socials: [{ label: "View Profile", href: "https://cit.edu.in/faculty/dr-r-sudha-muthusamy-430" }] },
  { id: "SDC-25-26-032", slug: "dr-k-e-hemapriya", name: "Dr K. E. Hemapriya", role: "Staff Advisor", program: "CIT Faculty", division: "Staff Advisors", avatar: "https://lh3.googleusercontent.com/d/1zGWRWjZ8yoIU5kvJcN8n0GYcZs7uG8C8=w1000", noIdCard: true, socials: [{ label: "View Profile", href: "https://cit.edu.in/faculty/dr-k-e-hemapriya" }] },
];

/* =========================================================
   Team Hover List + Member Profile Popup (team.html)
   URL: team.html?m=<slug> shows a profile overlay
   ========================================================= */

(function () {
  const container = document.getElementById("teamHoverList");
  if (!container) return;

  // Check if a member profile is requested
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("m");

  if (slug) {
    // Show member profile as overlay/popup
    const member = SDC_TEAM.find((p) => p.slug === slug);
    if (!member) {
      container.innerHTML = `<div class="member-profile-overlay is-active"><div class="member-profile"><h2>Member not found</h2><p>This profile doesn't exist.</p><a href="team.html" class="profile-back">← Back to Team</a></div></div>`;
      return;
    }

    document.title = `${member.name} — SDC CIT`;

    const socialsHTML = (member.socials || []).map(s =>
      `<a href="${s.href}" target="_blank" rel="noopener">${s.label}</a>`
    ).join("");

    container.innerHTML = `
      <div class="member-profile-overlay is-active">
        <div class="member-profile">
          <a href="team.html" class="profile-close" aria-label="Close profile">×</a>
          <div class="profile-top">
            <div class="profile-photo">
              <img src="${member.avatar}" alt="${member.name}" loading="lazy" />
            </div>
            <div class="profile-info">
              <span class="profile-id">${member.id}</span>
              <h1>${member.name}</h1>
              <p class="profile-role">${member.role}</p>
              <p class="profile-program">${member.program}</p>
              <p class="profile-division">${member.division}</p>
              <div class="profile-socials">${socialsHTML}</div>
            </div>
          </div>
          <div class="profile-footer">
            <a href="team.html" class="profile-back">← Back to Team</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Render team list grouped by division
  const divisions = {};
  SDC_TEAM.forEach((m) => {
    const d = m.division || "Members";
    if (!divisions[d]) divisions[d] = [];
    divisions[d].push(m);
  });

  Object.entries(divisions).forEach(([divName, members]) => {
    const section = document.createElement("div");
    section.className = "team-hover-section";

    const heading = document.createElement("h2");
    heading.textContent = divName;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "team-hover-grid";

    members.forEach((member) => {
      const item = document.createElement("div");
      item.className = "team-member";

      const name = document.createElement("a");
      name.className = "team-member-name";
      name.textContent = member.name;
      name.href = `team.html?m=${member.slug}`;
      item.appendChild(name);

      // Hover card
      const card = document.createElement("div");
      card.className = "team-card";
      card.innerHTML = `
        ${member.avatar ? `<img class="team-card-avatar" src="${member.avatar}" alt="${member.name}" loading="lazy" />` : ""}
        <h3>${member.name}</h3>
        <p class="team-card-role">${member.role}</p>
        ${member.program ? `<p class="team-card-program">${member.program}</p>` : ""}
        <div class="team-card-socials">${(member.socials || []).map(s => `<a href="${s.href}" target="_blank" rel="noopener">${s.label}</a>`).join("")}</div>
      `;
      item.appendChild(card);
      grid.appendChild(item);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
})();

/* =========================================================
   Proximity Text Effect (home page)
   ========================================================= */

(function () {
  const el = document.getElementById("proximityText");
  if (!el) return;

  const paragraph = el.querySelector("p");
  if (!paragraph) return;

  const html = paragraph.innerHTML;
  const parts = html.split(/(<[^>]+>)/g);
  const wrapped = parts.map((part) => {
    if (part.startsWith("<")) return part;
    return part.replace(/(\S+)/g, '<span class="word">$1</span>');
  }).join("");
  paragraph.innerHTML = wrapped;

  const words = paragraph.querySelectorAll(".word");
  const RADIUS = 140;

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    words.forEach((word) => {
      const wr = word.getBoundingClientRect();
      const wx = wr.left + wr.width / 2 - rect.left;
      const wy = wr.top + wr.height / 2 - rect.top;
      const dist = Math.sqrt((mx - wx) ** 2 + (my - wy) ** 2);

      word.classList.remove("near", "closest");
      if (dist < RADIUS * 0.3) word.classList.add("closest");
      else if (dist < RADIUS) word.classList.add("near");
    });
  });

  el.addEventListener("mouseleave", () => {
    words.forEach((w) => w.classList.remove("near", "closest"));
  });
})();
