const cards = document.querySelectorAll(".card");

for (let card of cards) {
    card.addEventListener('click', () => {
        card.classList.toggle("turn");
    });
}
