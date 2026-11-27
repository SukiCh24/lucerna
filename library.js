
const map = document.getElementById("deck-map");
const detail = document.getElementById("detail-pane");
const placeholder = '<p class="detail-placeholder">Choose a card to reveal its meaning.</p>';
const suits = ["Wands", "Cups", "Swords", "Pentacles"];

// Wide screens show the card beside the map.
// Phones open the card on its own page instead.
function isWide() {
  return window.matchMedia("(min-width: 900px)").matches;
}

// "The Library": every card is a book on a shelf.
// Major Arcana bookcase: rows of 6, 6, 6 and 4.
// Minor Arcana bookcase: one shelf per suit, Ace to King.

// Each book gets a slightly different height and leather tone,
// picked from its position so it looks the same on every visit.
const bookTones = ["tone-1", "tone-2", "tone-3", "tone-4"];
const bookHeights = [0, 6, 2, 9, 4, 1, 7, 3];

function book(card, index) {
  const slug = slugify(card.name);
  const numeral = cardNumeral(card);
  const title = card.arcana === "Major" ? card.name.replace(/^The /, "") : cardIndexName(card);
  const seed = card.name.length * 7 + card.number * 3 + index;
  const tone = bookTones[seed % bookTones.length];
  const lift = bookHeights[(seed * 5) % bookHeights.length];
  return `
    <a class="book ${tone}" style="--lift:${lift}px" href="card.html?card=${slug}" data-card="${slug}" aria-label="${card.name}">
      <span class="book-numeral">${numeral}</span>
      <span class="book-title">${title}</span>
    </a>`;
}

function shelf(shelfCards, label) {
  const labelHTML = label ? `<p class="shelf-label">${label}</p>` : "";
  return `
    <div class="shelf">
      ${labelHTML}
      <div class="shelf-books">${shelfCards.map(book).join("")}</div>
      <div class="shelf-plank"></div>
    </div>`;
}

function bookcase(title, note, shelvesHTML, extraClass) {
  return `
    <section class="bookcase ${extraClass}">
      <p class="map-label">${title} <span>${note}</span></p>
      <div class="bookcase-frame">${shelvesHTML}</div>
    </section>`;
}

function renderMap() {
  const majors = cards.filter(function (c) { return c.arcana === "Major"; });
  const majorRows = [majors.slice(0, 6), majors.slice(6, 12), majors.slice(12, 18), majors.slice(18)];
  const majorShelves = majorRows.map(function (row) { return shelf(row, ""); }).join("");

  const minorShelves = suits.map(function (suit) {
    const suitCards = cards.filter(function (c) {
      return c.arcana === "Minor" && c.suit === suit;
    });
    return shelf(suitCards, suit);
  }).join("");

  map.innerHTML =
    bookcase("Major Arcana", "22 cards", majorShelves, "bookcase-major") +
    bookcase("Minor Arcana", "56 cards · four suits", minorShelves, "bookcase-minor");
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
  map.querySelectorAll("[data-card]").forEach(function (link) {
    link.classList.toggle("active", link.dataset.card === slug);
  });
  history.replaceState(null, "", "#" + slug);
}

// Clicking a card (or previous/next) on a wide screen
// shows it on the right instead of opening a new page.
function handleCardClick(event) {
  const link = event.target.closest("a[data-card]");
  if (!link || !isWide()) {
    return;
  }
  event.preventDefault();
  showCard(link.dataset.card);
}

map.addEventListener("click", handleCardClick);
detail.addEventListener("click", handleCardClick);

renderMap();
detail.innerHTML = placeholder;

// Reopen the last card, for example "#the-fool"
// (older links like "#Minor-Cups/ace-of-cups" still work).
const savedCard = location.hash.slice(1).split("/").pop();
if (savedCard && isWide()) {
  showCard(savedCard);
}
