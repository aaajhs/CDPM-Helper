const reminder_controller = require("../controllers/reminder_controller");

module.exports = function (app) {
  const { handle_modal } = reminder_controller;

  app.post("/reminder", handle_modal);
};