(() => {
  "use strict";

  const cards = [...document.querySelectorAll("[data-project-card]")];
  if (!cards.length) return;

  const search = document.querySelector("[data-project-search]");
  const filterButtons = [...document.querySelectorAll("[data-project-filter]")];
  const count = document.querySelector("[data-project-count]");
  const emptyState = document.querySelector("[data-project-empty]");
  const clearButton = document.querySelector("[data-clear-projects]");

  let activeFilter = "all";

  const setActiveFilter = (filter) => {
    activeFilter = filter;

    filterButtons.forEach((button) => {
      const isActive = button.dataset.projectFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const applyFilters = () => {
    const query = (search?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
      const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
      const matchesSearch = !query || card.textContent.toLowerCase().includes(query);
      const isVisible = matchesFilter && matchesSearch;

      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (count) count.textContent = `${visibleCount} project${visibleCount === 1 ? "" : "s"}`;
    emptyState?.classList.toggle("is-visible", visibleCount === 0);
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveFilter(button.dataset.projectFilter || "all");
      applyFilters();
    });
  });

  search?.addEventListener("input", applyFilters);

  clearButton?.addEventListener("click", () => {
    if (search) search.value = "";
    setActiveFilter("all");
    applyFilters();
    search?.focus();
  });

  setActiveFilter("all");
  applyFilters();
})();
