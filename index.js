const express = require('express');
const socket = require('socket.io');

const PORT = 4444;
const app = express();
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

let users = [];
let history = [];
app.use(express.static('chat'));

var io = socket(server);

io.on('connection', socket => {
    console.log('Client connected');

    socket.on('add user', username => {
        socket.username = username;
        users.push(username);
        socket.emit('history', history);
        io.sockets.emit('user list', users);
        io.sockets.emit('user joined', username);
    });

    socket.on('new message', data => {
        io.sockets.emit('new message', data);
        history.push(data);
    });

    socket.on('typing', username => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', username => {
        socket.broadcast.emit('stop typing', username);
    });

    socket.on('disconnect', () => {
        if(socket.username != null) {
            socket.broadcast.emit('user left', socket.username);
            users.splice(users.indexOf(socket.username), 1);
            io.sockets.emit('user list', users);
        }
        if(users.length == 0) {
            history = [];
        }
    })
})