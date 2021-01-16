// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png

// let img = document.createElement('img');
// img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';

// Selectors for DOM elements
const board = document.querySelector('.board')
const row = document.querySelector('.row')

const backs = document.querySelectorAll('.back');
const baseURL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const cards = document.querySelectorAll('.card');

// Enable turning cards around by clicking
for (let card of cards) {
    card.addEventListener('click', () => {
        card.classList.toggle("turn");
    });
}

// const pokemon = document.createElement('div');
// const img = createElement('img');
// pokemon.classList.add('pokemon');
// img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png";
// row.appendChild(pokemon);
// pokemon.appendChild(img);

// for (let i = 1; i < 10; 1++) {
//     // Create new img element
//     const img = document.createElement('img');
//     // Set img src to pokemon image
//     img.src = `${baseURL}${i}.png`;

//     // Append created img to backsides of cards
//     for (let back of backs) {
//         back.appendChild(img);
//     }

// }



