const inputJogador1 = document.querySelector("#jogador1");
const inputJogador2 = document.querySelector("#jogador2");
const inputRoomCode = document.querySelector("#roomCode");
const divCartasJogador1 = document.querySelector("#cartasJogador1");
const divCartasJogador2 = document.querySelector("#cartasJogador2");
const divVezDoJogador = document.querySelector("#vez-do-jogador");
const divAvisoPrevio = document.querySelector("#aviso-previo");
const btnJogarNovamente = document.querySelector("#jogar-novamente");
let divTempo;



let im = localStorage.getItem("im")// || 'jogador1';

console.log(`/${roomCode.value}`);
// const socket = io(`/${roomCode.value}`);

// ######################################################## DADOS ########################################################

const TEMPO_TOTAL = 360;
let flashcards, interval, segundos = TEMPO_TOTAL;

let cartasEncontradasJogador1 = 0;
let cartasEncontradasJogador2 = 0;
let cartas_corretas = {}
let vezDoJogador = inputJogador1.value;

let STATES = { 0: 'init', 1: 'play', 2: 'ended' };
let stateGame = STATES[0];
let executandoEfeito = false;

let frutas_escolhidas = [];
let clicouNaCarta = false;

// ######################################################## SOCKET ########################################################
function socket_on_startGame() {
    const base = [
        'abacaxi', 'pera', 'uva', 'apple', 'cereja', 'abacate',
        'melancia', 'morango', 'laranja', 'pessego', 'mirtilos', 'kiwi'
    ];
    const frutas = [...base, ...base];
    const emojis = {
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
    };

    board.innerHTML = '';
    for (let i = 0; i < frutas.length; i++) {
        const content = `
            <div class="flashcard">
                <div class="flashcard-inner" id="flashcard-${i}" onclick="escolher_flashcard(event)">
                    <div class="flashcard-front" id="ff-${i}">${frutas[i]}</div>
                    <div class="flashcard-back" id="fb-${i}"></div>  
                </div>
            </div>
        `;
        board.innerHTML += content;

        // Adiciona imagem na parte de trás da carta
        const fb = document.querySelector(`#fb-${i}`);
        const emoji = emojis[frutas[i]];
        fb.innerHTML = emoji;
    }
}



// ######################################################## FUNÇÕES ########################################################
function formatar_tempo() {
    return `0${parseInt(segundos / 60)}:${segundos % 60 < 10 ? '0' : ''}${segundos % 60}`;
}

function escolher_flashcard(e) {
    clicouNaCarta = true;
    const flashcard = e.target.closest('.flashcard-inner');
    const id = parseInt(flashcard.id.replace('flashcard-', ''));
    flashcard.classList.toggle('flip');
    // setTimeout(() =>{}, 1000)
    // alert('enviando: ' + JSON.stringify({ id, im }));
    // socket.emit('flip-flashcard', { id, im });
}

function fim_de_jogo() {
    clearInterval(interval);
    console.log('Fim de jogo!');
}

function exibir_aviso_previo() {
    // let i = 4;
    let i = 0;

    console.log('preparando...');
    let thisinterval = setInterval(() => {
        divAvisoPrevio.innerHTML = `Começando em ${i}...`;
        i--;
        if (i < 0) {
            clearInterval(thisinterval);
            console.log('iniciar jogo!');
            divAvisoPrevio.innerHTML = 'Tempo: <span id="tempo">0:00</span>';
            divTempo = document.querySelector('#tempo');
            divTempo.textContent = formatar_tempo();
        }
    }, 1000);

}

function jogo_rodando() {
    console.log('Jogo rodando...');
    interval = setInterval(() => {
        if (segundos > 0) {
            segundos -= 1;
            divTempo.textContent = formatar_tempo();
            if (segundos <= 10) divTempo.style.color = 'red';
        } else {
            fim_de_jogo();
            // showModal('modal-derrota');
        }
    }, 1000);
    // ################################### DELETE APAGARRRR ###################################
    socket_on_startGame();
}

function veificaInatividade() {
    setTimeout(() => {
        if (!clicouNaCarta) {
            console.log('perdeu a vez...');
        } else {
            clicouNaCarta = false;
            console.log('continuou a vez...');
        }
    }, 3000);
    console.log('Hello, World!');
}

function iniciar_jogo() {
    exibir_aviso_previo();
    setTimeout(() => {
        jogo_rodando();
        veificaInatividade();
    }, 1000);
}
iniciar_jogo()

// ######################################################## MODAL ########################################################

// Exibir modal específico
function showModal(tipo) {
    const modal = document.getElementById(tipo);
    modal.style.display = "flex";
}

// Fechar modal
function fecharModal(tipo) {
    document.getElementById(tipo).style.display = "none";
}
