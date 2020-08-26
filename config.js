const {
  WebClient
} = require('@slack/web-api'); //official slack web api
const web = new WebClient(process.env.token); //initialize
exports.web = web;

var targetChannel = 'bot-testspace'; // TAKE CAUTION @@@@@@@@@@@@@@@@@@@@@@@@@@@
exports.targetChannel = targetChannel;
