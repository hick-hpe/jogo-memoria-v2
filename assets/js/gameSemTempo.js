const inputJogador1 = document.querySelector("#jogador1");
const inputJogador2 = document.querySelector("#jogador2");
const inputRoomCode = document.querySelector("#roomCode");
let divCartasJogador1 = document.querySelector("#cartasJogador1");
let divCartasJogador2 = document.querySelector("#cartasJogador2");
let divVezDoJogador = document.querySelector("#vez-do-jogador");
const divAvisoPrevio = document.querySelector("#aviso-previo");
const modalConfirm = document.querySelector("#modal-confirm");
const btnConfirm = document.querySelector("#btn-confirm");
let btnJogarNovamente;
console.log('[BUTTON_JOGAR]: none');
document.getElementById("jogar-novamente").style.display = 'none';

const audioDuranteJogo = new Audio('/sounds/durante-jogo.mp3'); //
const audioVitoria = new Audio('/sounds/vitoria.mp3');
const audioDerrota = new Audio('/sounds/derrota.mp3');
const audioAcertou = new Audio('/sounds/acertou.mp3');
const audioErrou = new Audio('/sounds/errou.mp3');

let im = localStorage.getItem("im");
// Verificar permissão
const URL_ACCESS = `/keyAccess?im=${im}`;

let socket;

fetch(URL_ACCESS)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }
        return response.json(); // Extrai os dados JSON corretamente
    })
    .then(data => {
        console.log('dados retornados');
        console.log(data);

        console.log(`/${roomCode.value}`);
        socket = io(`/${roomCode.value}`);
        console.log('connect to game!!!!');
        habilitar_socket();

    })
    .catch(err => {
        window.location.href = '/';
    });


// ######################################################## DADOS ########################################################

let flashcards;
let STATES = { 0: 'init', 1: 'play', 2: 'ended' };
let stateGame = STATES[0];
let executandoEfeito = false;
let data_vezDoJogador = '';

// ######################################################## SOCKET ########################################################
function habilitar_socket() {
    socket.on('startGame', ({ frutas_id, emojis, vezDoJogador }) => {
        data_vezDoJogador = vezDoJogador;
        board.innerHTML = '';
        for (let id of Object.keys(frutas_id)) {
            const content = `
            <div class="flashcard">
                <div class="flashcard-inner" id="flashcard-${id}" onclick="escolher_flashcard(event)">
                    <div class="flashcard-front" id="ff-${id}"></div>
                    <div class="flashcard-back" id="fb-${id}"></div>  
                </div>
            </div>
        `;
            board.innerHTML += content;

            // Adiciona imagem na parte de trás da carta
            const fb = document.querySelector(`#fb-${id}`);
            const emoji = emojis[frutas_id[id]];
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

    socket.on('cartas-acertadas', ({ cartas_corretas_jogador1, cartas_corretas_jogador2, total }) => {
        document.querySelector('#cartasJogador1').textContent = cartas_corretas_jogador1;
        document.querySelector('#cartasJogador2').textContent = cartas_corretas_jogador2;

        if (total == cartas_corretas_jogador1 + cartas_corretas_jogador2) {
            stateGame = STATES[2];
            fim_de_jogo();

            let venceu = false;
            if (cartas_corretas_jogador1 > cartas_corretas_jogador2) {
                if (im === inputJogador1.value) {
                    venceu = true;
                } else {
                    venceu = false;
                }
            } else {
                if (im === inputJogador2.value) {
                    venceu = true;
                } else {
                    venceu = false;
                }
            }

            audioDuranteJogo.pause();
            let conteudo_modal = '';
            if (venceu) {
                conteudo_modal = `
                    <div id="modal-vitoria" class="modal">
                        <div class="modal-content vitoria">
                        <h2>🎉 Vitória!</h2>
                        <p>Você venceu!!!</p>
                        <button onclick="fecharModal('modal-vitoria')">OK</button>
                        </div>
                    </div>
                `;
                audioVitoria.play();
            } else {
                conteudo_modal = `
                    <div id="modal-derrota" class="modal">
                        <div class="modal-content derrota">
                        <h2>💀 Derrota!</h2>
                        <p><strong>${im === inputJogador1.value ? inputJogador2.value : inputJogador1.value}</strong> venceu!!!</p>
                        <button onclick="fecharModal('modal-derrota')">Tentar de Novo</button>
                    </div>
                `;
                audioDerrota.play();
            }

            if (!document.body.innerHTML.includes(conteudo_modal)) document.body.innerHTML += conteudo_modal;

            console.log('[BUTTON_JOGAR]: flex');
            btnJogarNovamente = document.getElementById("jogar-novamente");
            btnJogarNovamente.style.display = "flex";
            habilitar_btn();
        }
    });

    socket.on('encontrou-par', () => {
        audioAcertou.play();
    });

    socket.on('flip-two', ({ f1, f2 }) => {
        console.log('Ambos jogadores viraram cartas');
        audioErrou.play();

        const fc1 = document.querySelector(`#flashcard-${f1}`);
        const fc2 = document.querySelector(`#flashcard-${f2}`);
        fc1.classList.toggle('flip');
        fc2.classList.toggle('flip');
    });

    socket.on('received-invite', () => {
        btnJogarNovamente.innerHTML = `Você foi convidado para jogar novamente!`;
    });

    socket.on('to-default', () => {
        console.log('BUTTON');

        document.querySelector('#cartasJogador1').textContent = 0;
        document.querySelector('#cartasJogador2').textContent = 0;

        data_vezDoJogador = inputJogador1.value;
        document.querySelector('#vez-do-jogador').textContent = inputJogador1.value;

        btnJogarNovamente.textContent = "Jogar Novamente";
        btnJogarNovamente.style.display = 'none';

        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        audioDuranteJogo.pause();
        audioDuranteJogo.currentTime = 0;
        audioVitoria.pause();
        audioVitoria.currentTime = 0;
        audioDerrota.pause();
        audioDerrota.currentTime = 0;
        audioDuranteJogo.play();
    });

    socket.on('ply-disconnect', () => {
        alert('bye-bye-bye');
        window.location.href = '/';
    });

    socket.on('esperar-ply', () => {
        console.log('[MY_SELF]: wating');
        btnConfirm.innerHTML = '<img src="/img/loading.gif" alt=""><i>Esperando jogador...</i>';
        btnConfirm.classList.add('ed');
        btnConfirm.disabled = true;
    });

    socket.on('falta-vc', () => {
        const ply = im == inputJogador1.value ? inputJogador2.value : inputJogador1.value;
        btnConfirm.textContent = `${ply} está esperando você aceitar...`;
    });

    socket.on('iniciar-musica', () => {
        modalConfirm.style.display = 'none';
        console.log('[iniciar-musica]');
        audioDuranteJogo.play();

        audioDuranteJogo.addEventListener('ended', () => {
            audioDuranteJogo.play();
        });
    });
}


// ######################################################## FUNÇÕES ########################################################
btnConfirm.addEventListener('click', () => {
    socket.emit('confirm-ply', im);
});

function habilitar_btn() {
    btnJogarNovamente.addEventListener('click', () => {
        console.log('[click]: ' + btnJogarNovamente.textContent);

        if (btnJogarNovamente.innerHTML === 'Jogar Novamente') {
            const jogador = im === inputJogador1.value ? inputJogador2.value : inputJogador1.value;
            btnJogarNovamente.innerHTML = `
                <img src="/img/loading.gif" alt="carregando"> <i>Esperando ${jogador} aceitar</i>
            `;
            socket.emit('invite-play-again', im);
        } else {
            socket.emit('acept-play-again', im);
        }
    });
}

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
    console.log('Fim de jogo!');
}

function exibir_aviso_previo() {

}

function jogo_rodando() {
    console.log('Jogo rodando...');
}

function iniciar_jogo() {
    exibir_aviso_previo();
    setTimeout(() => {
        jogo_rodando();
    }, 1000);
}
iniciar_jogo();

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
