const roulette_service = require("../services/roulette_service");

module.exports = {
  get_result,
};

async function get_result(req, res) {
  let config = await roulette_service.get_from_db();
  // console.log("in controller: " + await roulette_service.get_from_db());
  roulette_service.post_to_channel(req, config);

  res.status(200).send();
}
