const roulette_service = require("../services/roulette_service");

module.exports = {
  get_result,
};

function get_result(req, res) {
  let config = roulette_service.get_from_db();
  roulette_service.post_to_channel(config);

  res.status(200).send();
}
