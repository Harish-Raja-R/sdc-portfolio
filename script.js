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
    if (menuPanel.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

document.querySelectorAll(".menu-panel a, .menu-pagination button").forEach((item) => {
  const target = item.getAttribute("href") || item.dataset.target;
  if (target === currentPage) {
    item.classList.add("is-current");
    if (item.tagName === "A") item.setAttribute("aria-current", "page");
  }

  item.addEventListener("click", (event) => {
    closeMenu();
    if (target && target.startsWith("#")) {
      event.preventDefault();
      setTimeout(() => document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }), 180);
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

document.querySelectorAll(".reveal").forEach((element) => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add("is-visible");
});

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
      if (status) status.textContent = "Complete every field before launching the message.";
      return;
    }

    const subject = encodeURIComponent(`SDC enquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`,
    );
    if (status) status.textContent = "Opening your mail app with the message prepared.";
    window.location.href = `mailto:sdc@citchennai.net?subject=${subject}&body=${body}`;
  });
}

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


/* ---------------------------------------------
   Team directory + member profile view (team.html)
   QR codes on ID cards point to: team.html?m=<slug>
--------------------------------------------- */

const SDC_TEAM = [
  {
    "id": "SDC-25-26-001",
    "slug": "theebikasri-jagadees",
    "name": "Theebikasri Jagadees",
    "role": "Executive Director",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Executive Directors",
    "avatar": "https://lh3.googleusercontent.com/d/11ptnl9KQ8kYWt69IprD6NfToQKdeZ_GH=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/theebikasri-jagadees-b6b597321?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/theebikasri.j?utm_source=qr&igsh=djNrcHFtdWJ3MXR1"
      }
    ]
  },
  {
    "id": "SDC-25-26-002",
    "slug": "shane-israel",
    "name": "Shane Israel",
    "role": "Executive Director",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Executive Directors",
    "avatar": "https://lh3.googleusercontent.com/d/1Zxk0cJxMs5nx4L-NeNB0uwBBj7QYjOPJ=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/shane-israel/"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_shane__israel_lh44_/"
      }
    ]
  },
  {
    "id": "SDC-25-26-003",
    "slug": "madhumitha-n",
    "name": "Madhumitha N",
    "role": "Chief Architect",
    "program": "MSc AI&ML, 4th Yr",
    "division": "Chief Architects",
    "avatar": "https://sdccit.vercel.app/assets/img/members25-26/MADHUMITHA.jpg",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/madhumitha-n-2526362a6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_.madhu._n?igsh=bDZ4NTJmamllOGtu"
      }
    ]
  },
  {
    "id": "SDC-25-26-004",
    "slug": "nikhil-s-s",
    "name": "Nikhil S S",
    "role": "Chief Architect",
    "program": "BE ECE, 4th Yr",
    "division": "Chief Architects",
    "avatar": "https://sdccit.vercel.app/assets/img/members25-26/Nikhil.jpg",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/nikhil-s-s-2005official?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/nikhil._.s.s?igsh=YnJma256NHg3MGxn"
      }
    ]
  },
  {
    "id": "SDC-25-26-005",
    "slug": "jeydarsana-j",
    "name": "Jeydarsana J",
    "role": "Associate Director",
    "program": "MSc DCS, 3rd Yr",
    "division": "Associate Directors",
    "avatar": "https://lh3.googleusercontent.com/d/1vjGPIeSZOl4Q-APdAbkQxSS5vo5obCCt=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/jeydarsana-j-994505329?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/__jd___06?igsh=M3lyOTZ2aG1tczBv"
      }
    ]
  },
  {
    "id": "SDC-25-26-006",
    "slug": "kalaiselvan-k",
    "name": "Kalaiselvan K",
    "role": "Associate Director",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Associate Directors",
    "avatar": "https://lh3.googleusercontent.com/d/1WjcNKoYHHGtD-7sY2mNrpzCAdSEiq-Hh=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/kalaiselvan-k-3871912a7"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/k_kalaiselvan_?igsh=MTI5Y3NtYjlpeWp3OA=="
      }
    ]
  },
  {
    "id": "SDC-25-26-007",
    "slug": "nesika-saravanan",
    "name": "Nesika Saravanan",
    "role": "Treasurer",
    "program": "MSc SS, 3rd Yr",
    "division": "Treasurers",
    "avatar": "https://lh3.googleusercontent.com/d/133GGALqIbZOwcjSMJbjkg9IfQ90Ovdaz=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/nesika-saravanan-261981339?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/__.nesika.__"
      }
    ]
  },
  {
    "id": "SDC-25-26-008",
    "slug": "nithish-venkat",
    "name": "Nithish Venkat",
    "role": "Treasurer",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Treasurers",
    "avatar": "https://lh3.googleusercontent.com/d/1kGRbGLHTDO1W3hxIXILfNOxIrqcgnArf=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/nithish-venkat-4756442b4?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/freak.nx4?igsh=N2oyenlteTRqeDJ5"
      }
    ]
  },
  {
    "id": "SDC-25-26-009",
    "slug": "lakshana-ramesh",
    "name": "Lakshana Ramesh",
    "role": "External Affairs",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "External Affairs Lead",
    "avatar": "https://lh3.googleusercontent.com/d/1nYLQjlJe4Tev3ciy22j-lvFMfFtCmOKy=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/lakshana-ramesh-04b84b320"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_lakshana_ramesh06?igsh=ZHIxNnp4ejJpM2Jo&utm_source=qr"
      }
    ]
  },
  {
    "id": "SDC-25-26-010",
    "slug": "ananthika-c",
    "name": "Ananthika C.",
    "role": "Technical Management Lead",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Heads of Technical Management",
    "avatar": "https://lh3.googleusercontent.com/d/10W1kn1dg0gd0nG1Kt34gooKj73gPZ_vh=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/ananthika-c-7996a3320?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/antarcticx._?igsh=OTR4ODFteW91eDd0&utm_source=qr"
      }
    ]
  },
  {
    "id": "SDC-25-26-011",
    "slug": "harish-raja-r",
    "name": "Harish Raja R",
    "role": "Technical Management Lead",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Heads of Technical Management",
    "avatar": "https://lh3.googleusercontent.com/d/1ym0614ueasHHI-2fLJVYgEbVZ-GTTJ0A=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/harish-raja-r"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/harish.weirdo"
      }
    ]
  },
  {
    "id": "SDC-25-26-012",
    "slug": "vijayaganth-kathiresan",
    "name": "Vijayaganth Kathiresan",
    "role": "Technical Consultant",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "Technical Consultants",
    "avatar": "https://lh3.googleusercontent.com/d/1PEvoFauuIN8v5thTEoVx6WFyhBrfq7z7=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/vijayaganth-k-verified-b20406375?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/sdc_cit/"
      }
    ]
  },
  {
    "id": "SDC-25-26-013",
    "slug": "shri-sundaram",
    "name": "Shri Sundaram",
    "role": "Technical Consultant",
    "program": "BE ECE, 2nd Yr",
    "division": "Technical Consultants",
    "avatar": "https://lh3.googleusercontent.com/d/1zQ34kIGpXhiesWgD989lNm35Q4VVHnAZ=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://linkedin.com/in/shri-sundaram-2b2bb5383"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/sdc_cit/"
      }
    ]
  },
  {
    "id": "SDC-25-26-014",
    "slug": "hayakreev-raja",
    "name": "Hayakreev Raja",
    "role": "Technical Consultant",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "Technical Consultants",
    "avatar": "https://lh3.googleusercontent.com/d/16XWeK4HalQzaU8A6aExqSRB-sg8yN41i=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/hayakreev-raja-a54508395?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/hayak_015?utm_source=qr&igsh=Znc2eWo2eXhhdm1r"
      }
    ]
  },
  {
    "id": "SDC-25-26-015",
    "slug": "adhidev-s",
    "name": "Adhidev S",
    "role": "Technical Consultant",
    "program": "MSc SS, 2nd Yr",
    "division": "Technical Consultants",
    "avatar": "https://lh3.googleusercontent.com/d/1jZu6GHYhguXZRFwET-uI9ld02Ujc9pfE=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/company/sdc-cit/"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/adhidev_02"
      }
    ]
  },
  {
    "id": "SDC-25-26-016",
    "slug": "bhuvanesh-a",
    "name": "Bhuvanesh A",
    "role": "Technical Consultant",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "Technical Consultants",
    "avatar": "https://lh3.googleusercontent.com/d/11aJ_Z7gMlL-7bvqR8NnS_X98-YxKiLSH=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/bhuvanesh-a-16321b320?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_.bhuvanesh._10_?igsh=dmkwbXhmMDJrNW1k"
      }
    ]
  },
  {
    "id": "SDC-25-26-017",
    "slug": "dharshini-s",
    "name": "Dharshini S",
    "role": "Technical Consultant",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "Technical Consultants",
    "avatar": "https://lh3.googleusercontent.com/d/1GIZzw-tqlZETR2hxdCWJ9fF8_xt-QuAV=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/dharshini-s-526a52375?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_d.h.a.r.s.h.in.i_?igsh=MXAwM3FyeGJ0b2VmMA=="
      }
    ]
  },
  {
    "id": "SDC-25-26-018",
    "slug": "adhiya-rangaraj",
    "name": "Adhiya Rangaraj",
    "role": "Head of Public Relations",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Head of Public Relations",
    "avatar": "https://lh3.googleusercontent.com/d/1zkbqcBzfJXBC3H1IbQuwLoaUuozA2qDW=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/adhiya-rangaraj-a3429a302/"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/sdc_cit/"
      }
    ]
  },
  {
    "id": "SDC-25-26-019",
    "slug": "saadhia-h",
    "name": "Saadhia H",
    "role": "Public Relations Team",
    "program": "BE CSE, 2nd Yr",
    "division": "The Public Relations Team",
    "avatar": "https://lh3.googleusercontent.com/d/1Cnqfrxe5NkxwfKmQbZyJqRklaJbfqfhY=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/saadhia-h-1b5990384?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/sdc_cit/"
      }
    ]
  },
  {
    "id": "SDC-25-26-020",
    "slug": "ashwanth-s",
    "name": "Ashwanth S",
    "role": "Public Relations Team",
    "program": "BE CSE, 2nd Yr",
    "division": "The Public Relations Team",
    "avatar": "https://lh3.googleusercontent.com/d/1IYpiMI33XI350n6fOJk-Np5TADHo2sr3=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/ashwanth-s-3ab75737a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/ashwanth7704?igsh=bWtoeGtibHdiZWVj"
      }
    ]
  },
  {
    "id": "SDC-25-26-021",
    "slug": "ashwina-jayakrishnan",
    "name": "Ashwina Jayakrishnan",
    "role": "Public Relations Team",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "The Public Relations Team",
    "avatar": "https://lh3.googleusercontent.com/d/1fJH3mzkRuXOPYmI5Fb1Gch3qM-mo0u6r=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/ashwina-jayakrishnan-00b783355?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/ashhwee_.__?igsh=MTgxcmJlMnV1d2t0bg%3D%3D&utm_source=qr"
      }
    ]
  },
  {
    "id": "SDC-25-26-022",
    "slug": "samiksha-muthukumar",
    "name": "Samiksha Muthukumar",
    "role": "Head of Design",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "Head of Design",
    "avatar": "https://lh3.googleusercontent.com/d/1qIuNry87uZpu3e_Gmvc9n4xuXaxLgLYG=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/samiksha-muthukumar-499b60320/"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/unique__grl__25/"
      }
    ]
  },
  {
    "id": "SDC-25-26-023",
    "slug": "rochana-r",
    "name": "Rochana R",
    "role": "Designer",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "Designers",
    "avatar": "https://lh3.googleusercontent.com/d/10_br9f425vV6QRvaBTn3OXJvHT0yWRnw=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/rochana-r-419a8b388?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_.sugarrrr?igsh=djBybTZpbXp0ZjU5"
      }
    ]
  },
  {
    "id": "SDC-25-26-024",
    "slug": "charan-sekar",
    "name": "Charan Sekar",
    "role": "Designer",
    "program": "MSc DS, 2nd Yr",
    "division": "Designers",
    "avatar": "https://lh3.googleusercontent.com/d/1cs0rVSCNSXHSGefBsCWjQDMakJTpVg45=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/charan-sekar-4670a0381"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/l_cy_offl?igsh=bGlneGo2cWV6dW5i"
      }
    ]
  },
  {
    "id": "SDC-25-26-025",
    "slug": "rithika-m",
    "name": "Rithika M",
    "role": "Designer",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "Designers",
    "avatar": "https://lh3.googleusercontent.com/d/1qwdAmjPaQaN_NT9BUT7XQlw4-51pzcuv=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/rithika-m-a797783bb"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/rithikamohan_?igsh=MWt1ZDN2eWZ4ZHV0Nw=="
      }
    ]
  },
  {
    "id": "SDC-25-26-026",
    "slug": "lathikka-ma",
    "name": "Lathikka MA",
    "role": "Program Management Lead",
    "program": "MSc DS, 3rd Yr",
    "division": "Head of Program Management",
    "avatar": "https://lh3.googleusercontent.com/d/1c0aNqgU7yh3rXeaRGMxNtsqilW2rqKY7=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/lathikka-ma-cit"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/lathikkkaa?igsh=OG1pcm50NjE5OW5t"
      }
    ]
  },
  {
    "id": "SDC-25-26-027",
    "slug": "janani-sree",
    "name": "Janani Sree",
    "role": "Program Manager",
    "program": "MSc AI&ML, 2nd Yr",
    "division": "The Program Managers",
    "avatar": "https://lh3.googleusercontent.com/d/1fU5aTdG5YEvr58z7z4ZrXVTo2wpFEy6v=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/janani-sree-6a6491372?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/jananisreep?igsh=ZTBzMnQ1anFueXp3"
      }
    ]
  },
  {
    "id": "SDC-25-26-028",
    "slug": "aakash-balasubramani",
    "name": "Aakash Balasubramani",
    "role": "Program Manager",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "The Program Managers",
    "avatar": "https://lh3.googleusercontent.com/d/1jCzDOgGM2SKch3ypjJT4Oo3NH-Xqvfqu=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/aakash-balasubramani-994b47320?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_.aakash.b._?igsh=bm5sN2N2cTJzdHh4"
      }
    ]
  },
  {
    "id": "SDC-25-26-029",
    "slug": "keerthana-venkatachalam",
    "name": "Keerthana Venkatachalam",
    "role": "Program Manager",
    "program": "MSc AI&ML, 3rd Yr",
    "division": "The Program Managers",
    "avatar": "https://lh3.googleusercontent.com/d/1YFtp8tx--dBy2QGpO78Hhf-ZQYPbUn-3=w1000",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://www.linkedin.com/in/keerthana-venkatachalam-340394320?utm_source=share_via&utm_content=profile&utm_medium=member_android"
      },
      {
        "label": "Instagram",
        "href": "https://www.instagram.com/_.keerthh.__?igsh=ejI4aWQyMWk3M2xx"
      }
    ]
  },
  {
    "id": "SDC-25-26-030",
    "slug": "dr-d-k-kavitha",
    "name": "Dr D.K. Kavitha",
    "role": "Staff Advisor",
    "program": "CIT Faculty",
    "division": "Staff Advisors",
    "avatar": "https://lh3.googleusercontent.com/d/1ANBuN1TqFKojC5ofZhutTpXsXrlO569z=w1000",
    "noIdCard": true,
    "socials": [
      {
        "label": "View Profile",
        "href": "https://cit.edu.in/faculty/dr-d-kavitha"
      }
    ]
  },
  {
    "id": "SDC-25-26-031",
    "slug": "dr-r-sudha-muthusamy",
    "name": "Dr R. Sudha Muthusamy",
    "role": "Staff Advisor",
    "program": "CIT Faculty",
    "division": "Staff Advisors",
    "avatar": "https://lh3.googleusercontent.com/d/1E5ODHmwA7xNL3lp3u79jWj2qeFIMpjrk=w1000",
    "noIdCard": true,
    "socials": [
      {
        "label": "View Profile",
        "href": "https://cit.edu.in/faculty/dr-r-sudha-muthusamy-430"
      }
    ]
  },
  {
    "id": "SDC-25-26-032",
    "slug": "dr-k-e-hemapriya",
    "name": "Dr K. E. Hemapriya",
    "role": "Staff Advisor",
    "program": "CIT Faculty",
    "division": "Staff Advisors",
    "avatar": "https://lh3.googleusercontent.com/d/1zGWRWjZ8yoIU5kvJcN8n0GYcZs7uG8C8=w1000",
    "noIdCard": true,
    "socials": [
      {
        "label": "View Profile",
        "href": "https://cit.edu.in/faculty/dr-k-e-hemapriya"
      }
    ]
  }
];

(function () {
  const teamListView = document.getElementById("teamListView");
  const profileView = document.getElementById("profileView");
  if (!teamListView || !profileView) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("m");
  if (!slug) return;

  const member = SDC_TEAM.find((person) => person.slug === slug);
  const card = document.getElementById("profileCard");
  const notFound = document.getElementById("profileNotFound");
  const breadcrumbDivision = document.getElementById("profileDivision");
  const navWrap = document.getElementById("profileNav");
  const footer = document.getElementById("teamFooter");

  teamListView.hidden = true;
  profileView.hidden = false;

  if (!member) {
    notFound.hidden = false;
    breadcrumbDivision.textContent = "Not Found";
    document.title = "Profile Not Found - Student Developers Cell";
    return;
  }

  document.title = `${member.name} - Student Developers Cell`;
  breadcrumbDivision.textContent = member.division;

  document.getElementById("profileAvatar").src = member.avatar || "";
  document.getElementById("profileAvatar").alt = member.name;
  document.getElementById("profileId").textContent = member.id;
  document.getElementById("profileName").textContent = member.name;
  document.getElementById("profileDivisionLine").textContent = member.division;
  document.getElementById("profileRole").textContent = member.role;
  document.getElementById("profileProgram").textContent = member.program;

  // Staff advisors (member.noIdCard === true) get no member-ID badge and
  // no dummy ID card / QR mockup — those elements are stripped from the
  // DOM entirely for them, not just visually hidden.
  const profileIdChip = document.getElementById("profileIdChip");
  if (profileIdChip) {
    if (member.noIdCard) {
      profileIdChip.remove();
    } else {
      profileIdChip.hidden = false;
    }
  }

  const idCardMock = document.getElementById("idCardMock");
  if (idCardMock) {
    if (member.noIdCard) {
      idCardMock.remove();
    } else {
      document.getElementById("idCardPhoto").src = member.avatar || "";
      document.getElementById("idCardPhoto").alt = member.name;
      document.getElementById("idCardName").textContent = member.name;
      document.getElementById("idCardRole").textContent = member.role;
      document.getElementById("idCardId").textContent = member.id;
      idCardMock.hidden = false;
    }
  }

  const socialsWrap = document.getElementById("profileSocials");
  (member.socials || []).forEach((social) => {
    const a = document.createElement("a");
    a.href = social.href;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "secondary";
    a.textContent = social.label;
    socialsWrap.appendChild(a);
  });

  card.hidden = false;

  if (footer) {
    footer.innerHTML = '<a href="team.html">Back to Team</a><span>SDC CIT</span>';
  }

  const copyBtn = document.getElementById("copyLinkBtn");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        copyBtn.textContent = "Link Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy Profile Link";
        }, 1800);
      })
      .catch(() => {
        copyBtn.textContent = "Copy Failed";
        setTimeout(() => {
          copyBtn.textContent = "Copy Profile Link";
        }, 1800);
      });
  });

  const index = SDC_TEAM.findIndex((person) => person.slug === slug);
  const prev = SDC_TEAM[(index - 1 + SDC_TEAM.length) % SDC_TEAM.length];
  const next = SDC_TEAM[(index + 1) % SDC_TEAM.length];

  if (SDC_TEAM.length > 1) {
    navWrap.innerHTML = `
      <a href="team.html?m=${prev.slug}">
        <small>&larr; Previous Member</small>
        <strong>${prev.name}</strong>
      </a>
      <a href="team.html?m=${next.slug}">
        <small>Next Member &rarr;</small>
        <strong>${next.name}</strong>
      </a>
    `;
  }
})();