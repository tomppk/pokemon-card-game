// URL for pokemon images
// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png

// Selectors for DOM elements
const board = document.querySelector('.board')
const row = document.querySelector('.row')

const fronts = document.querySelectorAll('.front');
const backs = document.querySelectorAll('.back');
const baseURL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const cards = document.querySelectorAll('.card');

let flipCounter = 0;

for (let card of cards) {
    card.addEventListener('click', () => {
        card.classList.add("turn");
    });
}

// Enable turning cards around by clicking
// for (let card of cards) {
//     card.addEventListener('click', () => {
//         card.classList.toggle("turn");
//     });
// }

// Add pokemon logo to card frontsides
for (let i = 0; i < fronts.length; i++) {
    let img = document.createElement('img');
    img.src = "pokemon_logo.svg";
    fronts[i].appendChild(img);
}

// Add pokemon images to card backsides
for (let i = 0; i < backs.length; i++) {
    let img = document.createElement('img');
    img.src = `${baseURL}${i + 1}.png`
    backs[i].appendChild(img);
}

// function addImage(cardSide) {
//     for (let i = 0; i < cardSide.length; i++) {
//         let img = document.createElement('img');
//         img.src = "pokemon_logo.svg";
//         img.src = `${baseURL}${i}.png`
//         cardSide[i].appendChild(img);
//     }
// }

