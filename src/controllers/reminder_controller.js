const reminder_service = require("../services/reminder_service");

module.exports = {
  handle_modal,
};

function handle_modal(req, res) {
  const payload = JSON.parse(req.body.payload);
  try{
    if(payload.view){
      console.log(payload.view.state.values);
    }
  }
  catch(err){
    console.log(err);
  }
  reminder_service.handle_modal(payload);

  res.status(200).send();
}
