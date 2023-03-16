const server = require("./server");
const socketServer = require("./socket_server");

socketServer(server);

const port = process.env.PORT || 3002;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
