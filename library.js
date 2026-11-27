// "The Library": every card is a book in one matching set.
// Major Arcana bookcase: shelves of 6, 6, 6 and 4.
// Minor Arcana bookcase: one shelf per suit, Ace to King.
// Choosing a book opens its card in a pop-up over the shelves.

const map = document.getElementById("deck-map");
const popup = document.getElementById("card-popup");
const popupBody = document.getElementById("popup-body");
const closeButton = document.getElementById("popup-close");
const suits = ["Wands", "Cups", "Swords", "Pentacles"];

function book(card) {
  const slug = slugify(card.name);
  const title = card.arcana === "Major" ? card.name.replace(/^The /, "") : cardIndexName(card);
  const binding = card.arcana === "Major" ? "binding-major" : "binding-" + card.suit.toLowerCase();
  return `
    <a class="book ${binding}" href="card.html?card=${slug}" data-card="${slug}" aria-label="${card.name}">
      <span class="book-numeral">${cardNumeral(card)}</span>
      <span class="book-title">${title}</span>
    </a>`;
}

function shelf(shelfCards, label) {
  return `
    <div class="shelf">
      <p class="shelf-label">${label}</p>
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

function renderShelves() {
  const majors = cards.filter(function (c) { return c.arcana === "Major"; });
  const majorRows = [majors.slice(0, 6), majors.slice(6, 12), majors.slice(12, 18), majors.slice(18)];
  const majorLabels = ["0 – V", "VI – XI", "XII – XVII", "XVIII – XXI"];
  const majorShelves = majorRows.map(function (row, i) { return shelf(row, majorLabels[i]); }).join("");

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

function openCard(slug) {
  const card = cards.find(function (c) {
    return slugify(c.name) === slug;
  });
  if (!card) {
    return;
  }
  popupBody.innerHTML = cardDetailHTML(card);
  popup.scrollTop = 0;
  map.querySelectorAll("[data-card]").forEach(function (link) {
    link.classList.toggle("active", link.dataset.card === slug);
  });
  if (!popup.open) {
    popup.showModal();
  }
  history.replaceState(null, "", "#" + slug);
}

function closeCard() {
  if (popup.open) {
    popup.close();
  }
}

// Choosing a book, or previous/next inside the pop-up,
// shows that card in the pop-up instead of opening a new page.
function handleCardClick(event) {
  const link = event.target.closest("a[data-card]");
  if (!link) {
    return;
  }
  event.preventDefault();
  openCard(link.dataset.card);
}

map.addEventListener("click", handleCardClick);
popupBody.addEventListener("click", handleCardClick);
closeButton.addEventListener("click", closeCard);

// Clicking the dark area around the pop-up closes it too.
popup.addEventListener("click", function (event) {
  if (event.target === popup) {
    closeCard();
  }
});

// However it closes (button, outside click, Escape), forget the open card.
popup.addEventListener("close", function () {
  map.querySelectorAll(".book.active").forEach(function (b) { b.classList.remove("active"); });
  history.replaceState(null, "", location.pathname + location.search);
});

renderShelves();

// Reopen a card from the address, for example "#the-fool"
// (older links like "#Minor-Cups/ace-of-cups" still work).
const savedCard = location.hash.slice(1).split("/").pop();
if (savedCard) {
  openCard(savedCard);
}
