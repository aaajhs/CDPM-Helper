const roulette_service = require("../services/roulette_service");

module.exports = {
  get_result,
};

async function get_result(req, res) {
  roulette_service.post_to_channel(req);

  res.status(200).send();
}
