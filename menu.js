// The menu button (three lines) in the top-left corner.
// It opens a small panel with links to the main parts of Lucerna.

(function () {
  const links = [
    { label: "Home", href: "index.html" },
    { label: "The Library", href: "library.html" }
  ];

  const here = location.pathname.split("/").pop() || "index.html";

  const menu = document.createElement("nav");
  menu.className = "site-menu";
  menu.innerHTML = `
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <div class="menu-panel">
      ${links.map(function (link) {
        const current = link.href === here ? ' aria-current="page"' : "";
        return `<a href="${link.href}"${current}>${link.label}</a>`;
      }).join("")}
    </div>`;
  document.body.prepend(menu);

  const button = menu.querySelector(".menu-toggle");

  function setOpen(isOpen) {
    menu.classList.toggle("open", isOpen);
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    button.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  button.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!menu.classList.contains("open"));
  });

  // Close when clicking anywhere else, or pressing Escape
  document.addEventListener("click", function (event) {
    if (!menu.contains(event.target)) {
      setOpen(false);
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
})();
