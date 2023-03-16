const indexR = require("./index");
const usersR = require("./users");
const statisticsR = require("./statistics");
const categoriesR = require("./categories");
const gamesR = require("./games");
const bestPlayersR = require("./bestPlayers");

exports.routesInit = (app) => {
  app.use("/", indexR);
  app.use("/users", usersR);
  app.use("/statistics", statisticsR);
  app.use("/categories", categoriesR);
  app.use("/games", gamesR);
  app.use("/bestPlayers", bestPlayersR);

  app.use("*", (req, res) => {
    res.status(404).json({ err: "endpoint not found , 404", error: 404 });
  });
};
