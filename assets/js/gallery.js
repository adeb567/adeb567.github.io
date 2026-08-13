(() => {
  "use strict";

  const grid = document.querySelector("[data-gallery-grid]");
  if (!grid) return;

  const items = Array.isArray(window.GALLERY_ITEMS) ? window.GALLERY_ITEMS : [];
  let lastFocusedItem = null;

  const closeLightbox = () => {
    const lightbox = document.querySelector(".gallery-lightbox");
    if (!lightbox) return;

    lightbox.remove();
    document.body.classList.remove("gallery-lightbox-open");
    document.removeEventListener("keydown", handleLightboxKeydown);
    lastFocusedItem?.focus();
  };

  const handleLightboxKeydown = (event) => {
    if (event.key === "Escape") closeLightbox();
  };

  const openLightbox = (item, trigger) => {
    closeLightbox();
    lastFocusedItem = trigger;

    const lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", item.alt || "Gallery photo");

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt || "Gallery photo";
    image.decoding = "async";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "gallery-lightbox-close";
    closeButton.setAttribute("aria-label", "Close photo");
    closeButton.textContent = "×";

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.append(image, closeButton);
    document.body.appendChild(lightbox);
    document.body.classList.add("gallery-lightbox-open");
    document.addEventListener("keydown", handleLightboxKeydown);
    closeButton.focus();
  };

  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    if (!item || typeof item.src !== "string") return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    button.setAttribute("aria-label", item.alt || `Open gallery photo ${index + 1}`);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt || `Gallery photo ${index + 1}`;
    image.loading = "eager";
    image.decoding = "async";

    if (Number.isFinite(item.width) && Number.isFinite(item.height)) {
      image.width = item.width;
      image.height = item.height;
    }

    image.addEventListener(
      "error",
      () => {
        button.hidden = true;
      },
      { once: true }
    );

    button.addEventListener("click", () => openLightbox(item, button));
    button.appendChild(image);
    fragment.appendChild(button);
  });

  grid.replaceChildren(fragment);
})();
