const roulette_controller = require("../controllers/roulette_controller");

module.exports = function (app) {
  const { get_result } = roulette_controller;

  app.post("/roulette", get_result);
};