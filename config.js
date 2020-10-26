const express = require('express');
const bodyParser = require("body-parser");
const admin = require('firebase-admin');
const fs = require('fs');
const { WebClient } = require('@slack/web-api'); //official slack web api
const web = new WebClient(process.env.token); //initialize

var targetChannel = 'bot-testspace'; // TAKE CAUTION @@@@@@@@@@@@@@@@@@@@@@@@@@@


exports.express = express;
exports.bodyParser = bodyParser;
exports.admin = admin;
exports.fs = fs;
exports.web = web;
exports.targetChannel = targetChannel;
