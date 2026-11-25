const list = document.getElementById("card-list");
const detail = document.getElementById("detail-pane");
const suitNav = document.getElementById("suit-nav");
const arcanaButtons = document.querySelectorAll("[data-arcana]");
const suitButtons = document.querySelectorAll("[data-suit]");
const placeholder = '<p class="detail-placeholder">Choose a card to reveal its meaning.</p>';

let currentArcana = "Major";
let currentSuit = "Wands";

// Wide screens show the card beside the index.
// Phones open the card on its own page instead.
function isWide() {
  return window.matchMedia("(min-width: 900px)").matches;
}

function currentView() {
  return currentArcana === "Major" ? "Major" : "Minor-" + currentSuit;
}

// Read the web address, for example "#Minor-Cups/ace-of-cups",
// so the page reopens where the reader left off.
const saved = location.hash.slice(1).split("/");
const savedView = saved[0];
const savedCard = saved[1];
if (savedView.startsWith("Minor")) {
  currentArcana = "Minor";
  const savedSuit = savedView.split("-")[1];
  if (savedSuit) {
    currentSuit = savedSuit;
  }
}

function render() {
  arcanaButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.arcana === currentArcana);
  });
  suitButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.suit === currentSuit);
  });
  suitNav.style.display = currentArcana === "Minor" ? "flex" : "none";

  history.replaceState(null, "", "#" + currentView());
  detail.innerHTML = placeholder;

  const shown = cards.filter(function (card) {
    if (currentArcana === "Major") {
      return card.arcana === "Major";
    }
    return card.arcana === "Minor" && card.suit === currentSuit;
  });

  list.innerHTML = "";
  list.classList.toggle("minor", currentArcana === "Minor");

  if (shown.length === 0) {
    list.innerHTML = '<li class="empty">These cards are still being written.</li>';
    return;
  }

  shown.forEach(function (card) {
    const slug = slugify(card.name);
    list.innerHTML += `
      <li>
        <a class="card-link" href="card.html?card=${slug}" data-card="${slug}">
          ${card.arcana === "Major" ? `<span class="card-numeral">${cardNumeral(card)}</span>` : ""}
          <span>${cardIndexName(card)}</span>
        </a>
      </li>`;
  });
}

function showCard(slug) {
  const card = cards.find(function (c) {
    return slugify(c.name) === slug;
  });
  if (!card) {
    return;
  }
  detail.innerHTML = cardDetailHTML(card);
  detail.scrollTop = 0;
  list.querySelectorAll(".card-link").forEach(function (link) {
    link.classList.toggle("active", link.dataset.card === slug);
  });
  history.replaceState(null, "", "#" + currentView() + "/" + slug);
}

// Clicking a card name (or previous/next) on a wide screen
// shows it on the right instead of opening a new page.
function handleCardClick(event) {
  const link = event.target.closest("a[data-card]");
  if (!link || !isWide()) {
    return;
  }
  event.preventDefault();
  showCard(link.dataset.card);
}

list.addEventListener("click", handleCardClick);
detail.addEventListener("click", handleCardClick);

arcanaButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentArcana = button.dataset.arcana;
    render();
  });
});

suitButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentSuit = button.dataset.suit;
    render();
  });
});

render();
if (savedCard && isWide()) {
  showCard(savedCard);
}
