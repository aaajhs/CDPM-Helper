const roulette_service = require("../services/roulette_service");

module.exports = {
  get_result,
};

async function get_result(req, res) {
  let config = await roulette_service.get_from_db();
  await console.log("in controller: " + config);
  await roulette_service.post_to_channel(config);

  res.status(200).send();
}
