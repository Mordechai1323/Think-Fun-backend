const { Server } = require('socket.io');

const { CategoryModel } = require('./models/categoryModel');
const { MatchingGameModel } = require('./models/gameModel');
const allowedOrigins = require('./config/allowedOrigins');

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
    },
  });

  let waitingListTicTacToe = [];
  let waitingListMatchingGame = [];
  let waitingListCheckers = [];

  const rooms = [];

  io.on('connection', (socket) => {
    socket.on('start-tic-tac-toe', () => {
      waitingListTicTacToe.push(socket.id);

      if (waitingListTicTacToe.length == 2) {
        const idPlayer1 = waitingListTicTacToe.shift();
        const idPlayer2 = waitingListTicTacToe.shift();

        const room = {
          id_room: generateUniqueId(),
          idPlayer1,
          idPlayer2,
          whose_turn: idPlayer1,
        };
        io.to(idPlayer1).emit('game-started', room);
        io.to(idPlayer2).emit('game-started', room);
        if (!rooms) rooms = [room];
        else rooms.push(room);
      }
    });

    socket.on('start-matching-game', async () => {
      waitingListMatchingGame.push(socket.id);
      if (waitingListMatchingGame.length == 2) {
        const idPlayer1 = waitingListMatchingGame.shift();
        const idPlayer2 = waitingListMatchingGame.shift();

        const room = {
          id_room: generateUniqueId(),
          idPlayer1,
          idPlayer2,
          whose_turn: idPlayer1,
          counter: 0,
          cards: await doubleAndShuffleCards(),
        };
        io.to(idPlayer1).emit('game-started', room);
        io.to(idPlayer2).emit('game-started', room);
        if (!rooms) rooms = [room];
        else rooms.push(room);
      }
    });

    socket.on('start-checkers', () => {
      waitingListCheckers.push(socket.id);
      if (waitingListCheckers.length == 2) {
        const idPlayer1 = waitingListCheckers.shift();
        const idPlayer2 = waitingListCheckers.shift();

        const room = {
          id_room: generateUniqueId(),
          idPlayer1,
          idPlayer2,
          whose_turn: idPlayer1,
        };
        io.to(idPlayer1).emit('game-started', room);
        io.to(idPlayer2).emit('game-started', room);
        if (!rooms) rooms = [room];
        else rooms.push(room);
      }
    });

    socket.on('invite-friend-to-game', async (typeGame) => {
      let room;
      if (typeGame === 'matching_game') {
        room = {
          id_room: generateUniqueId(),
          idPlayer1: socket.id,
          idPlayer2: '',
          whose_turn: socket.id,
          counter: 0,
          cards: await doubleAndShuffleCards(),
        };
      } else {
        room = {
          id_room: generateUniqueId(),
          idPlayer1: socket.id,
          idPlayer2: '',
          whose_turn: socket.id,
        };
      }

      if (!rooms) rooms = [room];
      else rooms.push(room);
      io.to(socket.id).emit('invite-friend-to-game', room.id_room);
    });

    socket.on('invitation-link', (idRoom) => {
      rooms.forEach((room) => {
        if (room.id_room === idRoom) {
          room.idPlayer2 = socket.id;

          io.to(room.idPlayer1).emit('game-started', room);
          io.to(room.idPlayer2).emit('game-started', room);
        }
      });
    });

    socket.on('join-room', (idRoom) => {
      const numUsers = io.sockets.adapter.rooms.get(idRoom)?.size || 0;

      if (numUsers < 2) {
        socket.join(idRoom);
        socket.emit('join-room-success');
      } else {
        socket.emit('join-room-error', 'Room is full');
      }
    });

    socket.on('active-game', (gameObject) => {
      rooms.forEach((room) => {
        if (room.id_room === gameObject.id_room && room.whose_turn === socket.id) {
          room.whose_turn = room.whose_turn === room.idPlayer1 ? room.idPlayer2 : room.idPlayer1;
          gameObject.whose_turn = room.whose_turn;
          socket.to(gameObject.id_room).emit('active-game', gameObject);
        }
      });
    });

    socket.on('active-matching-game', (gameObject) => {
      rooms.forEach((room) => {
        if (room.id_room === gameObject.id_room && room.whose_turn === socket.id) {
          room.counter++;
          if (room.counter == 2) {
            room.whose_turn = room.whose_turn === room.idPlayer1 ? room.idPlayer2 : room.idPlayer1;
            gameObject.whose_turn = room.whose_turn;
            room.counter = 0;
          }
          socket.to(gameObject.id_room).emit('active-matching-game', gameObject);
        }
      });
    });

    socket.on('send-message', (messageObject) => {
      socket.to(messageObject.id_room).emit('receiver-message', messageObject);
    });

    socket.on('disconnected', () => {
      // let index = waitingListTicTacToe.indexOf(socket.id);
      // index === -1 ? (index = waitingListMatchingGame.indexOf(socket.id)) : waitingListTicTacToe.splice(index, 1);
      // index === -1 ? (index = waitingListCheckers.indexOf(socket.id)) : waitingListMatchingGame.splice(index, 1);
      // index !== -1
      //   ? waitingListCheckers.splice(index, 1)
      //   : rooms.forEach((room, i) => {
      //       if (room.idPlayer1 === socket.id || room.idPlayer2 === socket.id) {
      //         socket.to(room.id_room).emit('user-left', `User ${socket.id} has left the room`);
      //         rooms.splice(i, 1);
      //       }
      //     });
      let index = waitingListTicTacToe.indexOf(socket.id);
      index !== -1
        ? waitingListTicTacToe.splice(index, 1)
        : (index = waitingListMatchingGame.indexOf(socket.id)) !== -1
        ? waitingListMatchingGame.splice(index, 1)
        : (index = waitingListCheckers.indexOf(socket.id)) !== -1
        ? waitingListCheckers.splice(index, 1)
        : rooms.forEach((room, i) => {
            if (room.idPlayer1 === socket.id || room.idPlayer2 === socket.id) {
              socket.to(room.id_room).emit('user-left', `User ${socket.id} has left the room`);
              rooms.splice(i, 1);
            }
          });
    });

    socket.on('disconnect', () => {
      let index = waitingListTicTacToe.indexOf(socket.id);
      index === -1 ? (index = waitingListMatchingGame.indexOf(socket.id)) : waitingListTicTacToe.splice(index, 1);
      index === -1 ? (index = waitingListCheckers.indexOf(socket.id)) : waitingListMatchingGame.splice(index, 1);
      index !== -1 ? waitingListCheckers.splice(index, 1) : '';

      rooms.forEach((room, i) => {
        if (room.idPlayer1 === socket.id || room.idPlayer2 === socket.id) {
          socket.to(room.id_room).emit('user-left', `User ${socket.id} has left the room`);
          rooms.splice(i, 1);
        }
      });
    });
  });
};

const generateUniqueId = () => {
  const randomPart = Math.random().toString(36).substring(2, 5);
  const timestampPart = new Date().getTime().toString();
  const id = randomPart + timestampPart;

  return id;
};

//TODO order in random
const doubleAndShuffleCards = async () => {
  const categories = await CategoryModel.find();
  const randomNumber = Math.floor(Math.random() * categories.length);
  const cards = await MatchingGameModel.find({ category_id: categories[randomNumber].category_id });
  const newCards = cards.map((card) => ({ ...card, isOpen: false, isMatched: false }));
  const doubledCards = newCards.concat(newCards);
  // const doubledCards = cards.concat(cards);
  // const mixedCards = doubledCards.sort(() => Math.random() - 0.5);

  return doubledCards;
};
