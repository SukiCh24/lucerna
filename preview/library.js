// "Map of the deck": the whole deck laid out by its structure.
// Major Arcana on top, then the four suits side by side,
// each running Ace to Ten, then the four court cards.

const map = document.getElementById("deck-map");
const detail = document.getElementById("detail-pane");
const placeholder = '<p class="detail-placeholder">Choose a card to reveal its meaning.</p>';
const suits = ["Wands", "Cups", "Swords", "Pentacles"];

// Wide screens show the card beside the map.
// Phones open the card on its own page instead.
function isWide() {
  return window.matchMedia("(min-width: 900px)").matches;
}

function majorTile(card) {
  const slug = slugify(card.name);
  return `
    <a class="map-major" href="card.html?card=${slug}" data-card="${slug}">
      <span class="map-num">${romanNumerals[card.number]}</span>
      <span class="map-name">${card.name.replace(/^The /, "")}</span>
    </a>`;
}

function minorCell(card) {
  const slug = slugify(card.name);
  return `<a class="map-minor" href="card.html?card=${slug}" data-card="${slug}">${cardIndexName(card)}</a>`;
}

function suitColumn(suit) {
  const suitCards = cards.filter(function (c) {
    return c.arcana === "Minor" && c.suit === suit;
  });
  const numbered = suitCards.filter(function (c) { return c.number <= 10; });
  const court = suitCards.filter(function (c) { return c.number > 10; });
  return `
    <div class="map-suit">
      <h3>${suit}</h3>
      <div class="map-pips">${numbered.map(minorCell).join("")}</div>
      <div class="map-court">${court.map(minorCell).join("")}</div>
    </div>`;
}

function renderMap() {
  const majors = cards.filter(function (c) { return c.arcana === "Major"; });
  map.innerHTML = `
    <section>
      <p class="map-label">Major Arcana <span>22 cards</span></p>
      <div class="map-major-grid">${majors.map(majorTile).join("")}</div>
    </section>

    <section>
      <p class="map-label">Minor Arcana <span>56 cards · four suits</span></p>
      <div class="map-suits">${suits.map(suitColumn).join("")}</div>
    </section>`;
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
