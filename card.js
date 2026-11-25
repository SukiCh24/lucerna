const page = document.getElementById("card-page");
const wanted = new URLSearchParams(location.search).get("card");
const card = cards.find(function (c) {
  return slugify(c.name) === wanted;
});

if (!card) {
  page.innerHTML = `
    <a class="back-link" href="library.html">← The Library</a>
    <p class="empty">This card could not be found.</p>`;
} else {
  document.title = card.name + " · Lucerna";
  page.innerHTML =
    `<a class="back-link" href="library.html#${cardView(card)}">← The Library</a>` +
    cardDetailHTML(card);
}
