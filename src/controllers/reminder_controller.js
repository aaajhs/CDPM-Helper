const reminder_service = require("../services/reminder_service");

module.exports = {
  handle_modal,
};

function handle_modal(req, res) {
  reminder_service.handle_modal(req.body.payload);

  res.status(200).send();
}
