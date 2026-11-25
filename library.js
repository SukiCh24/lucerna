const list = document.getElementById("card-list");
const detail = document.getElementById("detail-pane");
const suitNav = document.getElementById("suit-nav");
const arcanaButtons = document.querySelectorAll("[data-arcana]");
const suitButtons = document.querySelectorAll("[data-suit]");
const layout = document.querySelector(".library-layout");
const placeholder = '<p class="detail-placeholder">Choose a card to reveal its meaning.</p>';
const suitPlaceholder = '<p class="detail-placeholder">Choose a suit to see its cards.</p>';

// Shown before anything is chosen: a short guide to the two halves of the deck.
const introHTML = `
  <div class="arcana-intro">
    <h2>Two halves of the deck</h2>
    <p>A tarot deck holds 78 cards, divided into two groups that speak in different voices.</p>

    <h3>Major Arcana <span class="count">22 cards</span></h3>
    <p>Numbered from 0 to XXI, from The Fool to The World. These cards speak of the big chapters of life: turning points, deep lessons, and forces larger than any single day. When one appears in a reading, it often points to something fundamental.</p>

    <h3>Minor Arcana <span class="count">56 cards</span></h3>
    <p>The everyday cards. They speak of specific situations, feelings, and choices, the details that fill our days. They come in four suits, each with ten numbered cards (Ace to Ten) and four court cards (Page, Knight, Queen, and King).</p>

    <ul class="suit-notes">
      <li><span>Wands</span> drive, passion, and creativity</li>
      <li><span>Cups</span> emotions and relationships</li>
      <li><span>Swords</span> thoughts, words, and conflict</li>
      <li><span>Pentacles</span> work, money, and the body</li>
    </ul>
  </div>`;

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
  layout.classList.toggle("choosing", !currentArcana);

  // Nothing chosen yet: big buttons on the left, the guide on the right
  // (on phones, the guide appears under the buttons instead).
  if (!currentArcana) {
    detail.innerHTML = introHTML;
    list.innerHTML = introHTML;
    return;
  }

  // Minor Arcana chosen, but no suit yet
  if (currentArcana === "Minor" && !currentSuit) {
    detail.innerHTML = suitPlaceholder;
    list.innerHTML = "";
    return;
  }

  detail.innerHTML = placeholder;

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
