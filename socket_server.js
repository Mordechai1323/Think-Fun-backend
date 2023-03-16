const { Server } = require("socket.io");

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  let waitingList = [];
  let player1;
  let player2;
  const socketRooms = new Map();
  io.on("connection", (socket) => {
    socket.on("start-game", () => {
      waitingList.push(socket.id);

      if (waitingList.length == 2) {
        player1 = waitingList.shift();
        player2 = waitingList.shift();
        idRoom = Date.now();
        io.to(player1).emit("game-started", idRoom);
        io.to(player2).emit("game-started", idRoom);
      } else {
        console.log(`Waiting for another player to join`);
        socket.emit("waiting");
      }
    });

    socket.on("active-game", (message, room) => {
      // console.log(`message is - ${message}\nto player id- ${room}`);
      socket.to(room).emit("active-game", message);
    });

    socket.on("join-room", (room) => {
      socket.join(room);
      if (!socketRooms.has(socket.id)) {
        socketRooms.set(socket.id, []);
      }
      socketRooms.get(socket.id).push(room);
      console.log(socketRooms);
    });

    socket.on("disconnect", () => {
      const index = waitingList.indexOf(socket.id);
      if (index !== -1) {
        waitingList.splice(index, 1);
      }
      if (socketRooms.has(socket.id)) {
        const room = socketRooms.get(socket.id);
        console.log(`User ${socket.id} has disconnected`);
        console.log(`User ${socket.id} was in rooms: ${room}`);

        socket.to(room).emit(
          "user-left",
          `User ${socket.id} has left the room`
        );

        socketRooms.delete(socket.id);
      }
    });
  });
};
