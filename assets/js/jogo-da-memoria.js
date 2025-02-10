// HTML
const board = document.querySelector('#board');
const tempo = document.querySelector('#tempo');
const resetButton = document.querySelector('#resetButton');
const cartas = document.querySelector('#cartas');
fecharModal('modal-vitoria');
fecharModal('modal-derrota');
const TEMPO_TOTAL = 60;
let flashcards, interval, segundos = TEMPO_TOTAL;
tempo.textContent = formatar_tempo();

let STATES = { 0: 'init', 1: 'play', 2: 'ended' };
let stateGame = STATES[0];
let executandoEfeito = false;

// Frutas
let frutas = [
    'abacaxi',
    'pera',
    'uva',
    'apple',
    'cereja',
    'abacate',
    'melancia',
    'morango',
    'laranja',
    'pessego',
    'mirtilos',
    'kiwi',
];
let frutas2 = [];
let emojis = {
    'abacaxi': '🍍',
    'pera': '🍐',
    'uva': '🍇',
    'apple': '🍎',
    'cereja': '🍒',
    'abacate': '🥑',
    'melancia': '🍉',
    'morango': '🍓',
    'laranja': '🍊',
    'pessego': '🍑',
    'mirtilos': '🫐',
    'kiwi': '🥝'
}
let total = parseInt(frutas.length);
let frutas_escolhidas = [];
let cartas_corretas = new Set(); // Armazena IDs das cartas já acertadas
cartas.textContent = `${parseInt(cartas_corretas.size / 2)}/${total}`;

// Embaralhar (Fisher-Yates)
function embaralhar_frutas() {
    frutas2 = [...frutas, ...frutas].sort(() => Math.random() - 0.5);

    // Adicionar na tela
    board.innerHTML = '';
    for (let i = 0; i < frutas2.length; i++) {
        const content = `
            <div class="flashcard">
                <div class="flashcard-inner" id="flashcard-${i}">
                    <div class="flashcard-front" id="ff-${i}"></div>
                    <div class="flashcard-back" id="fb-${i}"></div>  
                </div>
            </div>
        `;
        board.innerHTML += content;

        // Adiciona imagem na parte de trás da carta
        const fb = document.querySelector(`#fb-${i}`);
        const emoji = emojis[frutas2[i]];
        console.log("Emoji: " + emoji)
        fb.innerHTML = emoji;
    }
}


function atribuir_eventos() {
    flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach((flashcard) => {
        flashcard.addEventListener('click', escolher);
    });
}

function retirar_eventos() {
    flashcards.forEach((flashcard) => {
        flashcard.removeEventListener('click', escolher);
    });
}


// Escolher frutas
function escolher(e) {
    if (!executandoEfeito) {
        let flashcardInner = e.currentTarget.querySelector('.flashcard-inner'); // Obtém a div correta
        console.log(e.currentTarget);

        if (!flashcardInner) return; // Se não encontrou a div, sai da função

        let i = flashcardInner.id.replace('flashcard-', ''); // Extrai o índice numérico

        if (cartas_corretas.has(i) || frutas_escolhidas.length >= 2) return; // Verifica se já foi acertada ou se já escolheu 2 cartas

        // Virar a carta
        flashcardInner.classList.add('flip');
        frutas_escolhidas.push({ id: i, fruta: frutas2[i] });

        if (frutas_escolhidas.length === 2) {
            executandoEfeito = true;
            setTimeout(() => analisar_flashcards(), 500); // Pequeno delay antes de verificar
            executandoEfeito = false;
        }
    }
}


// Analisar flashcards
function analisar_flashcards() {
    let [primeira, segunda] = frutas_escolhidas;

    if (primeira.fruta === segunda.fruta) {
        // Se forem iguais, adiciona ao set de cartas corretas
        cartas_corretas.add(primeira.id);
        cartas_corretas.add(segunda.id);

        cartas.textContent = `${parseInt(cartas_corretas.size)}/${total}`;

        if (cartas_corretas.size == total) {
            fim_de_jogo();
            showModal('modal-vitoria');
        }
    } else {
        // Se forem diferentes, desvira as cartas
        let flashcard1 = document.querySelector(`#flashcard-${primeira.id}`);
        let flashcard2 = document.querySelector(`#flashcard-${segunda.id}`);

        flashcard1.classList.remove('flip');
        flashcard2.classList.remove('flip');
    }

    frutas_escolhidas = [];
}

function formatar_tempo() {
    return `0${parseInt(segundos / 60)}:${segundos % 60 < 10 ? '0' : ''}${segundos % 60}`;
}

function fim_de_jogo() {
    clearInterval(interval);
    console.log('Fim de jogo!');
    resetButton.disabled = false;
    resetButton.textContent = 'Jogar de novo';
    resetButton.style.backgroundColor = '#f44336';
    segundos = TEMPO_TOTAL;
    cartas.textContent = segundos;
    retirar_eventos();
}

function iniciar_tempo() {
    tempo.style.color = '';
    let fc_inner = document.querySelectorAll('.flashcard-inner');
    fc_inner.forEach((flashcard) => {
        flashcard.classList.add('flip');
    });

    setTimeout(() => {
        fc_inner.forEach((flashcard) => {
            flashcard.classList.remove('flip');
        });

        interval = setInterval(() => {
            if (segundos > 0) {
                segundos -= 1;
                let t = `${formatar_tempo()}`
                console.log(t);
                if (segundos <= 10) tempo.style.color = 'red';
                tempo.textContent = t;
            } else {
                fim_de_jogo();
                showModal('modal-derrota');
            }
        }, 1000);
    }, 1500);

}

function atribuir_eventos() {
    flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach((flashcard) => {
        flashcard.addEventListener('click', escolher);
    });
}

function retirar_eventos() {
    flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach((flashcard) => {
        flashcard.removeEventListener('click', escolher);
    });
}


// reiniciar jogo
resetButton.addEventListener('click', () => {
    if (resetButton.textContent == 'Jogar') {
        stateGame = STATES[1];
        resetButton.disabled = true;
        atribuir_eventos();
        iniciar_tempo();
    } else {
        tempo.textContent = formatar_tempo();
        resetButton.disabled = true;
        resetButton.style.backgroundColor = '#ccc';

        // Resetar variáveis
        cartas_corretas.clear();
        cartas.textContent = `${parseInt(cartas_corretas.size)}/${total}`;
        frutas_escolhidas = [];
        segundos = TEMPO_TOTAL;

        // Resetar flashcards
        let fc_inner = document.querySelectorAll('.flashcard-inner');
        fc_inner.forEach((flashcard) => {
            flashcard.classList.remove('flip');
        });

        retirar_eventos();
        embaralhar_frutas();
        atribuir_eventos();

        // iniciar 
        iniciar_tempo();
    }
});


// Exibir modal específico
function showModal(tipo) {
    const modal = document.getElementById(tipo);
    modal.style.display = "flex";
}

// Fechar modal
function fecharModal(tipo) {
    document.getElementById(tipo).style.display = "none";
}

embaralhar_frutas();
