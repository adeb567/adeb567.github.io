(() => {
  "use strict";

  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const mobileBreakpoint = window.matchMedia("(max-width: 980px)");

  const getStoredTheme = () => {
    try {
      return window.localStorage.getItem("theme");
    } catch {
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // The theme still works when storage is unavailable.
    }
  };

  const preferredTheme = () => {
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    themeColor?.setAttribute("content", theme === "dark" ? "#0f120f" : "#2f7d43");

    document.querySelectorAll(".theme-toggle").forEach((button) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", `Use ${nextTheme} theme`);
      button.setAttribute("title", `Use ${nextTheme} theme`);
    });
  };

  applyTheme(preferredTheme());

  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      storeTheme(nextTheme);
    });
  });

  const menu = document.querySelector(".site-nav");
  const menuButton = document.querySelector(".menu-toggle");

  const closeMenu = () => {
    if (!menu || !menuButton) return;
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  };

  if (menu && menuButton) {
    menuButton.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      document.body.classList.toggle("menu-open", isOpen && mobileBreakpoint.matches);
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (event) => {
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(event.target) || menuButton.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    mobileBreakpoint.addEventListener?.("change", closeMenu);
  }

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll(".reveal").forEach((element, index) => {
    const requestedDelay = Number.parseInt(element.dataset.revealDelay || "", 10);
    const delay = Number.isFinite(requestedDelay) ? requestedDelay : Math.min(index % 4, 3);
    element.style.setProperty("--reveal-delay", String(delay));
  });

  const profileCard = document.querySelector("[data-profile-card]");

  if (profileCard) {
    const faces = [...profileCard.querySelectorAll(".profile-face")];
    const flipButtons = [...profileCard.querySelectorAll("[data-card-flip]")];

    const setCardState = (isFlipped) => {
      profileCard.classList.toggle("is-flipped", isFlipped);
      flipButtons.forEach((button) => button.setAttribute("aria-pressed", String(isFlipped)));

      if (faces.length === 2) {
        faces[0].setAttribute("aria-hidden", String(isFlipped));
        faces[1].setAttribute("aria-hidden", String(!isFlipped));
        faces[0].inert = isFlipped;
        faces[1].inert = !isFlipped;
      }
    };

    setCardState(false);

    flipButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setCardState(!profileCard.classList.contains("is-flipped"));
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && profileCard.classList.contains("is-flipped")) {
        setCardState(false);
        flipButtons[0]?.focus();
      }
    });
  }
})();
