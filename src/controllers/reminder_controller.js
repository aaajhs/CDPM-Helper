const reminder_service = require("../services/reminder_service");

module.exports = {
  handle_modal,
};

function handle_modal(req, res) {
  console.log("Log 1");
  const payload = JSON.parse(req.body.payload);
  console.log("Log 2");
  reminder_service.handle_modal(payload);
  console.log("Log 3");

  res.status(200).send();
  console.log("Log 4");
}
