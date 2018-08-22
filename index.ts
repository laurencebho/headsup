import { Player } from "./src/player"; //might not all be necessary
import { Game } from "./src/game";
import { Server } from "./src/server";

var path  = require('path');
var express = require('express');
var app = express();
var expressSession = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var server = new Server();
var EventEmitter = require('events');
export var eventEmitter = new EventEmitter();

var pug = require('pug');
var expressValidator =  require('express-validator'); //can remove

var port = 3000;
var hostname = '127.0.0.1'; //localhost

io.on('connection', (socket) => {
  console.log('A user connected');
  //set session unless already set
  if (!socket.request.session.socketID) {
    socket.request.session.socketID = socket.id;
    socket.request.session.save();
  }
  if (socket.request.session.nickname) { //detect a reconnection
    console.log(socket.request.session.nickname + " has reconnected");
    io.to(socket.id).emit("connection received", socket.request.session.nickname);
  }
  else {
    io.to(socket.id).emit("connection received");
  }
  socket.on('disconnect', function(){
    console.log('A user disconnected');
    let room = server.getRoom(socket.id);
    if (room != 'none') {
      eventEmitter.emit('disconnect' + room, socket.id);
    }
    server.removePlayer(socket.id);
  });
  socket.on('join queue', function(nickname) { //not done yet
    if (nickname) {
      socket.request.session.nickname = nickname;
      socket.request.session.save();
  	  var newPlayer = new Player(nickname, socket);
    }
    else {
      var newPlayer = new Player(socket.request.session.nickname, socket);
    }
  	server.addPlayer(newPlayer);
  	console.log('Player created with nickname ' + newPlayer.nickname + ' and ID ' + newPlayer.id);
  	server.createGames(io);
  });
  socket.on('message', function(data) {
  	console.log('sending message to ' + server.getRoom(data.id));
  	io.to(server.getRoom(data.id)).emit('message', data.msg); //send message to the room containing the sender
  });
  socket.on('bet', function(data) {
  	console.log('bet' + server.getRoom(data.id));
  	eventEmitter.emit('bet' + server.getRoom(data.id), {amount: data.amount, id: data.id});
  });
  socket.on('call', function(id) {
  	eventEmitter.emit('call' + server.getRoom(id), id);
  });
  socket.on('check', function(id) {
  	eventEmitter.emit('check' + server.getRoom(id), id);
  });
  socket.on('fold', function(id) {
  	eventEmitter.emit('fold' + server.getRoom(id), id);
  });
  eventEmitter.on('game complete', function(id) {
    server.removeGame(id);
  });
});

http.listen(port, hostname, (err) => {
  if (err) {
    return console.log(err);
  }
  return console.log('server is listening on port ' + port);
});

app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views',  __dirname + '/views');

var session = expressSession({secret: 'secret', resave: false, saveUninitialized: true})
io.use(function (socket, next) {
  session(socket.request, socket.request.res, next);
});

app.use(session);
app.use(expressValidator());

var home = require('./routes/home.route');
app.use('/', home);