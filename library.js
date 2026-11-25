const list = document.getElementById("card-list");
const detail = document.getElementById("detail-pane");
const suitNav = document.getElementById("suit-nav");
const arcanaButtons = document.querySelectorAll("[data-arcana]");
const suitButtons = document.querySelectorAll("[data-suit]");
const placeholder = '<p class="detail-placeholder">Choose a card to reveal its meaning.</p>';

// Nothing is chosen when the page first opens.
let currentArcana = null;
let currentSuit = null;

// Wide screens show the card beside the index.
// Phones open the card on its own page instead.
function isWide() {
  return window.matchMedia("(min-width: 900px)").matches;
}

function currentView() {
  if (currentArcana === "Major") {
    return "Major";
  }
  if (currentArcana === "Minor") {
    return currentSuit ? "Minor-" + currentSuit : "Minor";
  }
  return "";
}

// Read the web address, for example "#Minor-Cups/ace-of-cups",
// so the page reopens where the reader left off.
const saved = location.hash.slice(1).split("/");
const savedView = saved[0];
const savedCard = saved[1];
if (savedView === "Major") {
  currentArcana = "Major";
} else if (savedView.startsWith("Minor")) {
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

  const view = currentView();
  history.replaceState(null, "", view ? "#" + view : location.pathname);
  detail.innerHTML = placeholder;

  // Show no cards until an arcana (and, for Minor, a suit) is chosen.
  if (!currentArcana || (currentArcana === "Minor" && !currentSuit)) {
    list.innerHTML = "";
    return;
  }

  const shown = cards.filter(function (card) {
    if (currentArcana === "Major") {
      return card.arcana === "Major";
    }
    return card.arcana === "Minor" && card.suit === currentSuit;
  });

  if (shown.length === 0) {
    list.innerHTML = '<p class="empty">These cards are still being written.</p>';
    return;
  }

  if (currentArcana === "Major") {
    list.innerHTML = cardListHTML(shown, "");
  } else {
    // Ace to Ten, then the four court cards in their own group
    const numbered = shown.filter(function (card) { return card.number <= 10; });
    const court = shown.filter(function (card) { return card.number > 10; });
    list.innerHTML =
      cardListHTML(numbered, "minor") +
      '<p class="group-label">Court cards</p>' +
      cardListHTML(court, "minor");
  }
}

function cardListHTML(group, extraClass) {
  const items = group.map(function (card) {
    const slug = slugify(card.name);
    const numeral = cardNumeral(card);
    return `
      <li>
        <a class="card-link" href="card.html?card=${slug}" data-card="${slug}">
          ${numeral ? `<span class="card-numeral">${numeral}</span>` : ""}
          <span>${cardIndexName(card)}</span>
        </a>
      </li>`;
  }).join("");
  return `<ul class="card-list ${extraClass}">${items}</ul>`;
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
