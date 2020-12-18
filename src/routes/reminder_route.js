const reminder_controller = require("../controllers/reminder_controller");

module.exports = function (app) {
  const { handle_modal } = reminder_controller;
  const { create_customer, add_customer_to_store } = customer_controller;

  app.post("/reminder", handle_modal);
};