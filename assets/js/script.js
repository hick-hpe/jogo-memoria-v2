const socket = io();
localStorage.setItem('im', null);

// ------------------------------------------------------ elementos da interface do usuário ---------------------------------------
const inputUsername = document.getElementById("username");
const badgeUsername = document.getElementById("user-badge");
const inputRoomCode = document.getElementById("room-code");
const badgeRoomCode = document.getElementById("room-badge");
const btnCreateRoom = document.getElementById("create-room");
const btnJoinRoom = document.getElementById("join-room");

// ------------------------------------------------------ eventos ------------------------------------------------------
btnCreateRoom.addEventListener("click", () => {
    const username = inputUsername.value;
    const roomCode = inputRoomCode.value;

    if (!btnCreateRoom.className.includes('cancelar')) {
        if (username && roomCode) {
            socket.emit("createRoom", { username, roomCode });
        }
        btnJoinRoom.disabled = true;
    } else {
        btnJoinRoom.disabled = false;
        inputUsername.disabled = true;
        inputRoomCode.disabled = false;
        badgeUsername.style.color = 'black';
        badgeUsername.textContent = "";
        btnCreateRoom.textContent = "Criar Sala";
        btnCreateRoom.classList.remove('cancelar');
        socket.emit("del-create-user-room", ({ username, roomCode }));
    }
});

btnJoinRoom.addEventListener("click", () => {
    const username = inputUsername.value;
    const roomCode = inputRoomCode.value;

    if (username && roomCode) {
        socket.emit("joinRoom", { username, roomCode });
    }
});

// ------------------------------------------------------ criação ------------------------------------------------------
socket.on("create-user", (msg) => {
    if (msg == 'error') {
        inputUsername.value = "";
        badgeUsername.style.color = 'red';
        badgeUsername.textContent = "Usuário já existe!";
    } else {
        inputUsername.disabled = true;
        badgeUsername.style.color = 'green';
        badgeUsername.textContent = "Usuário criado com sucesso!";
        btnCreateRoom.innerHTML = '<img src="/img/loading.gif" alt=""> Cancelar';
        btnCreateRoom.classList.add('cancelar');

        // salvar para excluir em caso de desconexão
        localStorage.setItem('sockID', socket.id);
    }
});

socket.on("create-room", (msg) => {
    if (msg == 'error') {
        inputRoomCode.value = "";
        badgeRoomCode.style.color = 'red';
        badgeRoomCode.textContent = "Sala já existe!";
    } else {
        inputRoomCode.disabled = true;
        badgeRoomCode.style.color = 'green';
        badgeRoomCode.textContent = "Sala criada com sucesso!";
    }
});

// ------------------------------------------------------- join -------------------------------------------------------

socket.on("join-user", (msg) => {
    if (msg == 'error') {
        inputUsername.value = "";
        badgeUsername.style.color = 'red';
        badgeUsername.textContent = "Usuário já existe!";
    } else {
        inputUsername.disabled = true;
        badgeUsername.style.color = 'green';
        badgeUsername.textContent = "Usuário criado com sucesso!";
    }
});

socket.on("join-room", (msg) => {
    if (msg == 'error') {
        inputRoomCode.value = "";
        badgeRoomCode.style.color = 'red';
        badgeRoomCode.textContent = "Sala não encontrada!";
    } else if (msg == 'full') {
        inputRoomCode.value = "";
        badgeRoomCode.style.color = 'red';
        badgeRoomCode.textContent = "Sala cheia!";
    } else {
        inputRoomCode.disabled = true;
        badgeRoomCode.style.color = 'green';
        badgeRoomCode.textContent = "Sala encontrada!";
    }
});

// ------------------------------------------------------- join -------------------------------------------------------


socket.on('entrar', ({ im, nomeSala }) => {
    localStorage.setItem('im', im);
    window.location.href = "/game/" + nomeSala;
});


function fechar_modal() {
    document.querySelector('.modal').style.display = 'none';
    const audio = new Audio('/sounds/tela-inicial.mp3');
    audio.play();

    audio.addEventListener('ended', () => audio.play());
}
