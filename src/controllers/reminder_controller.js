const reminder_service = require("../services/reminder_service");

module.exports = {
  handle_modal,
};

function handle_modal(req, res) {
  const payload = JSON.parse(req.body.payload);
  reminder_service.handle_modal(payload);

  res.status(200).send();
}
