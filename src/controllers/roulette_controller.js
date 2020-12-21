const roulette_service = require("../services/roulette_service");

module.exports = {
  get_result,
};

function get_result(req, res) {
  roulette_service.get_from_db()
    .then(order => {
      roulette_service.post_to_channel(req, config);
    })
    .catch(err => console.log("[App] Error retrieving roulette: ", err))

  res.status(200).send();
}
