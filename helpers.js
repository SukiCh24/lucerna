// Small tools shared by the library page and the card page.

const romanNumerals = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

// Turns "The Fool" into "the-fool" so it can be used in a web address.
function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// The small number shown next to a card's name in the index.
function cardNumeral(card) {
  if (card.arcana === "Major") {
    return romanNumerals[card.number];
  }
  return card.number <= 10 ? romanNumerals[card.number] : "";
}

// Which group a card belongs to, for example "Major" or "Minor-Cups".
function cardView(card) {
  return card.arcana === "Major" ? "Major" : "Minor-" + card.suit;
}

// In the index, Minor cards only need their rank ("Two"),
// because the suit is already chosen above.
function cardIndexName(card) {
  return card.arcana === "Major" ? card.name : card.name.split(" of ")[0];
}

const notWritten = '<span class="not-written">Not written yet</span>';

function textOrPending(text) {
  return text ? text : notWritten;
}

function keywordPills(words, extraClass) {
  if (words.length === 0) {
    return notWritten;
  }
  return words.map(function (word) {
    return `<span class="keyword ${extraClass}">${word}</span>`;
  }).join("");
}

function cardLink(card, text) {
  return `<a href="card.html?card=${slugify(card.name)}" data-card="${slugify(card.name)}">${text}</a>`;
}

// The "Reversed meanings" switch on the home page.
// The choice is remembered in this browser, even after closing it.
function reversedEnabled() {
  try {
    return localStorage.getItem("lucerna-reversed") === "on";
  } catch (error) {
    return false;
  }
}

function setReversed(isOn) {
  try {
    localStorage.setItem("lucerna-reversed", isOn ? "on" : "off");
  } catch (error) {
    // If the browser blocks saving, the switch simply won't be remembered.
  }
}

// Builds everything shown for one card: image, keywords, story, meanings.
// Section order: Story, Meaning, then Number & journey (Major) or Suit & number (Minor).
// Until a card's story is written, its old symbolism text is shown under Story.
function cardDetailHTML(card) {
  const group = cards.filter(function (c) {
    return c.arcana === card.arcana && c.suit === card.suit;
  });
  const position = group.indexOf(card);
  const previous = group[position - 1];
  const next = group[position + 1];

  const eyebrow = card.arcana === "Major"
    ? "Major Arcana · " + romanNumerals[card.number]
    : "Minor Arcana · " + card.suit;
  const showReversed = reversedEnabled();
  const artLabel = card.arcana === "Major"
    ? romanNumerals[card.number]
    : card.name.split(" of ")[0];

  return `
    <div class="card-detail">
      <div class="card-top">
        ${card.image
          ? `<div class="card-art has-image"><img src="${card.image}" alt="${card.name} card"></div>`
          : `<div class="card-art">${artLabel}</div>`}

        <div class="card-heading">
          <p class="card-eyebrow">${eyebrow}</p>
          <h2 class="card-title">${card.name}</h2>

          <p class="keyword-label">${showReversed ? "Upright" : "Keywords"}</p>
          <div class="keyword-row">${keywordPills(card.keywordsUpright, "")}</div>

          ${showReversed ? `
          <p class="keyword-label">Reversed</p>
          <div class="keyword-row">${keywordPills(card.keywordsReversed, "reversed")}</div>
          ` : ""}
        </div>
      </div>

      <div class="card-body">
        <section class="card-section">
          <h3>Story</h3>
          <p>${textOrPending(card.story || card.symbolism)}</p>
        </section>

        <section class="card-section">
          <h3>${showReversed ? "Upright meaning" : "Meaning"}</h3>
          <p>${textOrPending(card.upright)}</p>
        </section>

        ${showReversed ? `
        <section class="card-section">
          <h3>Reversed meaning</h3>
          <p>${textOrPending(card.reversed)}</p>
        </section>
        ` : ""}

        <section class="card-section">
          <h3>${card.arcana === "Major" ? "Number &amp; journey" : "Suit &amp; number"}</h3>
          <p>${textOrPending(card.suitAndNumber)}</p>
        </section>

        <nav class="card-pager">
          <span>${previous ? cardLink(previous, "← " + previous.name) : ""}</span>
          <span>${next ? cardLink(next, next.name + " →") : ""}</span>
        </nav>
      </div>
    </div>`;
}
