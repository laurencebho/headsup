"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var player_1 = require("./src/player"); //might not all be necessary
var server_1 = require("./src/server");
var path = require('path');
var express = require('express');
var app = express();
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var server = new server_1.Server();
var EventEmitter = require('events');
exports.eventEmitter = new EventEmitter();
var pug = require('pug');
var expressValidator = require('express-validator'); //can remove
var port = 3000;
var hostname = '127.0.0.1'; //localhost
io.on('connection', function (socket) {
    console.log('A user connected');
    socket.on('disconnect', function () {
        console.log('A user disconnected');
        server.removePlayer(socket.id);
    });
    socket.on('nickname set', function (nickname) {
        var newPlayer = new player_1.Player(nickname, socket);
        server.addPlayer(newPlayer);
        console.log('Player created with nickname ' + newPlayer.nickname + ' and ID ' + newPlayer.id);
        server.createGames(io);
    });
    socket.on('message', function (data) {
        console.log('sending message to ' + server.getRoom(data.id));
        io.to(server.getRoom(data.id)).emit('message', data.msg); //send message to the room containing the sender
    });
    socket.on('bet', function (data) {
        console.log('bet' + server.getRoom(data.id));
        exports.eventEmitter.emit('bet' + server.getRoom(data.id), { amount: data.amount, id: data.id });
    });
    socket.on('call', function (id) {
        exports.eventEmitter.emit('call' + server.getRoom(id), id);
    });
    socket.on('check', function (id) {
        exports.eventEmitter.emit('check' + server.getRoom(id), id);
    });
    socket.on('fold', function (id) {
        exports.eventEmitter.emit('fold' + server.getRoom(id), id);
    });
});
http.listen(port, hostname, function (err) {
    if (err) {
        return console.log(err);
    }
    return console.log('server is listening on port ' + port);
});
app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true, }));
app.use(expressValidator());
var home = require('./routes/home.route');
app.use('/', home);
