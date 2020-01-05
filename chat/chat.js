const socket = io.connect('127.0.0.1:4444');

const messageText = document.getElementById('messageText');
const username = document.getElementById('username');
const sendButton = document.getElementById('sendMessage');
const output = document.getElementById('output');
const isTyping = document.getElementById('isTyping');

let hasJoined = false;
let typedUsername = 'user' + Math.floor(Math.random() * (99 - 1 + 1)) + 1;
let currentUserList = [];
let typingUserList = new Set();

let typingTimer;
username.value = typedUsername;
document.getElementById('loginButton').addEventListener('click', () => {
    typedUsername = username.value;
    document.getElementById('chat').style.display = 'block';
    var s = document.getElementById('login').style.display = 'none';
    document.getElementById('usernameDisplay').innerHTML = `<strong>${typedUsername}</strong>`;
    socket.emit('add user', getSanitizedStr(typedUsername));
});

sendButton.addEventListener('click', () => {
    if(messageText.value == '') {
        return;
    }
    socket.emit('new message', {
        message: getSanitizedStr(messageText.value),
        username: username.value
    });
    messageText.value = '';
});

messageText.addEventListener('keypress', (e) => {
    if(e.key == 'Enter') {
        sendButton.click();
    }
    socket.emit('typing', username.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit('stop typing', username.value);
    }, 1000);
})

socket.on('new message', data => {
    isTyping.innerHTML = '';
    output.innerHTML += addMessage(data);
    output.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
});

socket.on('typing', username => {
    //isTyping.innerHTML = '<p><em>' + username + ' is typing... </em></p>';
    typingUserList.add(username);
    updateUserList(currentUserList, typingUserList);
});

socket.on('stop typing', username => {
    //isTyping.innerHTML = '';
    typingUserList.delete(username);
    updateUserList(currentUserList, typingUserList);
    console.log(typingUserList);
});

socket.on('user joined', username => {
    output.innerHTML += '<p><em>' + username + ' has joined</em></p>';
});

socket.on('user left', username => {
    output.innerHTML += '<p><em>' + username + ' has left</em></p>';
});

socket.on('user list', list => {
    currentUserList = list;
    updateUserList(list);
});

socket.on('history', history => {
    history.forEach(msg => output.innerHTML += addMessage(msg));
});

function addMessage(data) {
    if(data.username === typedUsername) {
        return '<p class="text-left"><strong>' + data.username + '</strong>: ' + data.message + '</p>';
    }
    else {
        return '<p class="text-right"><strong>' + data.username + '</strong>: ' + data.message + '</p>';
    }
}

function getSanitizedStr(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function updateUserList(list, typingUsernames) {
    if(typingUsernames === undefined) {
        typingUsernames = new Set();
    }
    let html = '';
    list.forEach(user => {
        if(typingUsernames.has(user)) {
            html += '<p>' + user + ' <em> is typing... </em> ' + '</p>'
        }
        else {
            html += '<p>' + user + '</p>'
        }
        
    });
    document.getElementById('users').innerHTML = html;
}