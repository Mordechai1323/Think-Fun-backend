const { Server } = require("socket.io");

module.exports = function (server) {
  const io = new Server(server, {
    methods: ["GET", "POST"],
    cors: {
      origin: ["http://localhost:3000", "https://jocular-muffin-880358.netlify.app"],
      credentials: true,
    },
    transports: ["websocket"],
  });

  let waitingList = [];
  let player1;
  let player2;
  const rooms = [];
  io.on("connection", (socket) => {
    socket.on("start-game", () => {
      waitingList.push(socket.id);

      console.log(waitingList);
      if (waitingList.length == 2) {
        player1 = waitingList.shift();
        player2 = waitingList.shift();

        const room = {
          id_room: generateUniqueId(),
          player1,
          player2,
          whose_turn: player1,
        };
        io.to(player1).emit("game-started", room);
        io.to(player2).emit("game-started", room);
        if (!rooms) rooms = [room];
        else rooms.push(room);
      }
    });

    socket.on("invite-friend-to-game", () => {
      const room = {
        id_room: generateUniqueId(),
        player1: socket.id,
        player2,
        whose_turn: player1,
      };
      if (!rooms) rooms = [room];
      else rooms.push(room);
      io.to(socket.id).emit("invite-friend-to-game", room.id_room);
      console.log(room);
    });

    socket.on("invitation-link", (id_room) => {
      rooms.forEach((room) => {
        if (room.id_room === id_room) {
          room.player2 = socket.id;
          io.to(room.player1).emit("game-started", room);
          io.to(room.player2).emit("game-started", room);
        }
      });
    });

    socket.on("join-room", (id_room) => {
      const numUsers = io.sockets.adapter.rooms.get(id_room)?.size || 0;

      if (numUsers < 2) {
        socket.join(id_room);
        socket.emit("join-room-success");
      } else {
        socket.emit("join-room-error", "Room is full");
      }
    });

    socket.on("active-game", (gameObject) => {
      rooms.forEach((room) => {
        if (room.id_room === gameObject.id_room && room.whose_turn === socket.id) {
          room.whose_turn = room.whose_turn === room.player1 ? room.player2 : room.player1;
          gameObject.whose_turn = room.whose_turn;
          socket.to(gameObject.id_room).emit("active-game", gameObject);
        }
      });
    });

    socket.on("send-message", (messageObject) => {
      socket.to(messageObject.id_room).emit("receiver-message", messageObject);
    });

    socket.on("disconnect", () => {
      const index = waitingList.indexOf(socket.id);
      if (index !== -1) {
        waitingList.splice(index, 1);
      }
      rooms.forEach((room, i) => {
        if (room.player1 == socket.id || room.player2 == socket.id) {
          socket.to(room.id_room).emit("user-left", `User ${socket.id} has left the room`);
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
