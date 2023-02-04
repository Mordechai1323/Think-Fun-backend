const indexR = require("./index");
const usersR = require("./users");
const statisticsR = require("./statistics");

exports.routesInit = (app) => {
  app.use("/", indexR);
  app.use("/users", usersR);
  app.use("/statistics", statisticsR);

  app.use("*", (req, res) => {
    res.status(404).json({ msg: "endpoint not found , 404", error: 404 });
  });
};
