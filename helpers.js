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

// The card frame from the Lucerna style guide: near-black card, bone lines,
// a thin inner border, the number at the top and the name at the bottom.
// Used for every card that doesn't have its own artwork yet.
function cardFrameSVG(card) {
  const numeral = cardNumeral(card);
  const name = card.name.toUpperCase();
  const spacing = name.length > 16 ? 3.2 : 5;
  return `<svg viewBox="0 0 350 600" role="img" aria-label="${card.name} card">
    <rect width="350" height="600" rx="18" fill="#0A0A0A"/>
    <rect x="0.5" y="0.5" width="349" height="599" rx="17.5" fill="none" stroke="#E6DCC6" stroke-opacity="0.3"/>
    <rect x="16" y="16" width="318" height="568" rx="10" fill="none" stroke="#E6DCC6" stroke-width="1"/>
    <text x="175" y="58" text-anchor="middle" fill="#E6DCC6" font-family="'Cormorant Garamond', serif" font-size="22" style="font-variant-numeric: lining-nums">${numeral}</text>
    <text x="175" y="560" text-anchor="middle" fill="#E6DCC6" font-family="'Cormorant Garamond', serif" font-size="17" letter-spacing="${spacing}">${name}</text>
  </svg>`;
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

// ---------- Foldable sections on the card page ----------
// Each section can be folded open or closed by tapping its title.
// These are the starting states; after that, the reader's own choice is
// remembered in this browser, so the next card opens the same way.
const sectionDefaults = {
  meaning: true,
  reversed: true,
  reading: true,
  questions: true,
  picture: false,
  number: false
};

function sectionOpen(id) {
  try {
    const saved = localStorage.getItem("lucerna-fold-" + id);
    if (saved === "open") return true;
    if (saved === "closed") return false;
  } catch (error) {
    // If the browser blocks saving, the starting states are used.
  }
  return sectionDefaults[id];
}

document.addEventListener("toggle", function (event) {
  const section = event.target;
  if (section.matches && section.matches("details.card-section[data-section]")) {
    try {
      localStorage.setItem("lucerna-fold-" + section.dataset.section, section.open ? "open" : "closed");
    } catch (error) {
      // Not remembered; nothing else breaks.
    }
  }
}, true);

function foldSection(id, title, inner) {
  return `
        <details class="card-section" data-section="${id}"${sectionOpen(id) ? " open" : ""}>
          <summary><h3>${title}</h3></summary>
          <div class="card-section-body">${inner}</div>
        </details>`;
}

function inReadingHTML(card) {
  const r = card.inReading;
  if (!r) {
    return `<p>${notWritten}</p>`;
  }
  return `<ul class="section-list">
            <li><strong>Love:</strong> ${textOrPending(r.love)}</li>
            <li><strong>Work:</strong> ${textOrPending(r.work)}</li>
            <li><strong>Personal growth:</strong> ${textOrPending(r.growth)}</li>
          </ul>`;
}

function questionsHTML(card) {
  if (!card.questions || card.questions.length === 0) {
    return `<p>${notWritten}</p>`;
  }
  return `<ul class="section-list">${card.questions.map(function (q) {
    return `<li>${q}</li>`;
  }).join("")}</ul>`;
}

// Cards written in the old format still have a "symbolism" paragraph;
// it is shown here until the card gets its list of symbols.
function inPictureHTML(card) {
  if (card.inPicture && card.inPicture.length > 0) {
    return `<ul class="section-list">${card.inPicture.map(function (item) {
      return `<li><strong>${item.symbol}:</strong> ${item.meaning}</li>`;
    }).join("")}</ul>`;
  }
  return `<p>${textOrPending(card.symbolism)}</p>`;
}

// Builds everything shown for one card: image, keywords, and the foldable sections.
// Section order: Meaning, (Reversed meaning), In a reading, Questions to ask yourself,
// In the picture, then Number & journey (Major) or Suit & number (Minor).
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

  return `
    <div class="card-detail">
      <div class="card-top">
        ${card.image
          ? `<div class="card-art has-image"><img src="${card.image}" alt="${card.name} card"></div>`
          : `<div class="card-art has-image">${cardFrameSVG(card)}</div>`}

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
        ${foldSection("meaning", showReversed ? "Upright meaning" : "Meaning", `<p>${textOrPending(card.upright)}</p>`)}
        ${showReversed ? foldSection("reversed", "Reversed meaning", `<p>${textOrPending(card.reversed)}</p>`) : ""}
        ${foldSection("reading", "In a reading", inReadingHTML(card))}
        ${foldSection("questions", "Questions to ask yourself", questionsHTML(card))}
        ${foldSection("picture", "In the picture", inPictureHTML(card))}
        ${foldSection("number", card.arcana === "Major" ? "Number &amp; journey" : "Suit &amp; number", `<p>${textOrPending(card.suitAndNumber)}</p>`)}

        <nav class="card-pager">
          <span>${previous ? cardLink(previous, "← " + previous.name) : ""}</span>
          <span>${next ? cardLink(next, next.name + " →") : ""}</span>
        </nav>
      </div>
    </div>`;
}
