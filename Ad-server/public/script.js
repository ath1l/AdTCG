document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  let openedCard = null;

  // Double-click to open
  cards.forEach(card => {
    card.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      if (openedCard) openedCard.classList.remove("opened");
      card.classList.add("opened");
      openedCard = card;
    });
  });

  // Click anywhere else to close
  document.body.addEventListener("click", (e) => {
    if (openedCard && !openedCard.contains(e.target)) {
      openedCard.classList.remove("opened");
      openedCard = null;
    }
  });
});

/**
 * This function simulates a screenshot being added
 * Call this with the URL of the new ad image
 */
function showScreenshotToEnvelope(imgSrc) {
  const img = document.createElement('img');
  img.src = imgSrc;
  img.className = 'screenshot-animation';
  img.style.left = '100px';
  img.style.top = '100px'; // or wherever the screenshot originates
  document.body.appendChild(img);

  img.addEventListener('animationend', () => {
    img.remove();
  });
}

// Example usage (remove this in production)
// setTimeout(() => showScreenshotToEnvelope('/uploads/sample-ad.png'), 2000);


