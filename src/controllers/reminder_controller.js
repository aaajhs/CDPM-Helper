const reminder_service = require("../services/reminder_service");

module.exports = {
  handle_modal,
};

function handle_modal(req, res) {
  let { type, trigger_id, view, state } = req/*.body.payload*/;

  reminder_service.handle_modal(type, trigger_id, view, state);

  res.status(200).send();
}
