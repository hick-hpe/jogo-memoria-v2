const inputJogador1 = document.querySelector("#jogador1");
const inputJogador2 = document.querySelector("#jogador2");
const inputRoomCode = document.querySelector("#roomCode");
const divCartasJogador1 = document.querySelector("#cartasJogador1");
const divCartasJogador2 = document.querySelector("#cartasJogador2");
const divVezDoJogador = document.querySelector("#vez-do-jogador");
const divAvisoPrevio = document.querySelector("#aviso-previo");
let divTempo;

let im = localStorage.getItem("im")// || 'jogador1';

console.log(`/${roomCode.value}`);
const socket = io(`/${roomCode.value}`);

// ######################################################## DADOS ########################################################

const TEMPO_TOTAL = 60;
let flashcards, interval, segundos = TEMPO_TOTAL;

let STATES = { 0: 'init', 1: 'play', 2: 'ended' };
let stateGame = STATES[0];
let executandoEfeito = false;
let data_vezDoJogador = '';

// ######################################################## SOCKET ########################################################
socket.on('startGame', ({ frutas, emojis, vezDoJogador }) => {
    data_vezDoJogador = vezDoJogador;
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
        // const fb = document.querySelector(`#ff-${i}`);
        const emoji = emojis[frutas[i]];
        // console.log("Emoji: " + emoji);
        fb.innerHTML = emoji;
    }
});

socket.on('flip-flashcard', (id) => {
    console.log('[flip-flashcard] virar o receiveed');
    const flashcard = document.querySelector(`#flashcard-${id}`);
    flashcard.classList.toggle('flip');
});

socket.on('vez-jogador', (vezDoJogador) => {
    data_vezDoJogador = vezDoJogador;
    divVezDoJogador.textContent = vezDoJogador;
});

socket.on('cartas-acertadas', ({ cartas_corretas_jogador1, cartas_corretas_jogador2 }) => {
    divCartasJogador1.textContent = cartas_corretas_jogador1;
    divCartasJogador2.textContent = cartas_corretas_jogador2;
});

socket.on('flip-two', ({ f1, f2 }) => {
    console.log('Ambos jogadores viraram cartas');
    const fc1 = document.querySelector(`#flashcard-${f1}`);
    const fc2 = document.querySelector(`#flashcard-${f2}`);
    fc1.classList.toggle('flip');
    fc2.classList.toggle('flip');
});


// ######################################################## FUNÇÕES ########################################################
function formatar_tempo() {
    return `0${parseInt(segundos / 60)}:${segundos % 60 < 10 ? '0' : ''}${segundos % 60}`;
}

function escolher_flashcard(e) {
    if (im == data_vezDoJogador) {
        const flashcard = e.target.closest('.flashcard-inner');
        const id = parseInt(flashcard.id.replace('flashcard-', ''));
        if (!flashcard.className.includes('flip')) {
            // se nao estiver virada, vire
            flashcard.classList.toggle('flip');
            console.log('[enviando] ' + JSON.stringify({ id, im }));
            socket.emit('flip-flashcard', { id, im });
        }
    } else {
        alert('Escolha do outro jogador');
    }
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
    // socket_on_startGame();
}

function iniciar_jogo() {
    exibir_aviso_previo();
    setTimeout(() => {
        jogo_rodando();
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
