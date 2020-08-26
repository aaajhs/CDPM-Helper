const config = require('./config');
const update_reminder = require('./update_reminder');
const mtlog = require('./mtlog');

// START BLOCK: Initialize Firebase
config.admin.initializeApp({
  credential: config.admin.credential.cert({
    "type": process.env.type,
    "project_id": process.env.project_id,
    "private_key_id": process.env.private_key_id,
    "private_key": process.env.private_key_1.replace(/\\n/g, '\n') + process.env.private_key_2.replace(/\\n/g, '\n'),
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri": process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url
  }),
  databaseURL: 'https://cdpu-helper.firebaseio.com'
});
const db = config.admin.firestore();
// END BLOCK: Initialize Firebase

// START BLOCK: Initialize Express
const app = config.express();
app.use(config.bodyParser.urlencoded({
  extended: true
}));
// END BLOCK: Initialize Express

console.log("[App] Update Alert targeting channel: " + config.targetChannel);

// START BLOCK: Code to run when server is restarted
// Retrieve last saved update info every 5 minutes
var updateRef = db.collection('event').doc('update');
setInterval(function() {
  let getDoc = updateRef.get()
    .then(doc => {
      console.log("[Alert Update] Last retrieved from DB: " + new Date());

      update_reminder.alertUpdate(doc.data().updateType, doc.data().startTime.toDate(), doc.data().endTime.toDate(), doc.data().updateDate);
    })
    .catch(err => {
      console.log('[Alert Update] Error getting document', err);
    });
}, 5 * 60 * 1000);
// END BLOCK: Code to run when server is restarted

// START BLOCK: Command Handler
app.post("/mtlog", (req, res) => {
  var today = new Date();
  var table = [":sarang:", ":nara2:", ":coco2:", ":borrie:"];


  var mtlogRef = db.collection('event').doc('mtlog');
  let getMTLog = mtlogRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('[mtlog] No such document!');
      } else {
        emojiEntry = doc.data().emojiEntry;
        lastCalled = doc.data().lastCalled.toDate();

        if (mtlog.getWeekNumber(lastCalled) != mtlog.getWeekNumber(today)) //if this is the first time this code is being called this week
          emojiEntry = (emojiEntry + 1) % 4

        let updateLastCalled = mtlogRef.set({
          'lastCalled': today,
          'emojiEntry': emojiEntry
        });
        console.log("[mtlog] emojiEntry: " + table[emojiEntry] + ", lastCalled: " + lastCalled);

        res.send();

        config.web.chat.postMessage({
          token: process.env.token,
          channel: req.body.channel_id,
          text: (table[emojiEntry]),
          link_names: 1
        }).catch(err => console.log(err))

      }
    })
    .catch(err => {
      console.log('[mtlog] Error getting document', err);
    });
});

app.post("/interactive-endpoint", (req, res) => {
  const {
    type,
    user,
    trigger_id,
    view
  } = JSON.parse(req.body.payload);
  const view01 = fs.readFileSync('./shortcut_reminder_view01.json', 'utf8');

  if (type === "view_submission") {
    const updateType = view.state.values.updateType01.updateType02.selected_option.value;
    const updateDate = view.state.values.updateDate01.updateDate02.selected_date;
    const updateStart = view.state.values.updateStart01.updateStart02.value;
    const updateEnd = view.state.values.updateEnd01.updateEnd02.value;

    const updateParameters = update_reminder.parameters(updateType, updateStart, updateEnd, updateDate);
    let update = updateRef.set({
      'updateType': updateType,
      'startTime': new Date(updateParameters[0]),
      'endTime': new Date(updateParameters[1]),
      'updateDate': updateDate
    });
  } else {
    config.web.views.open({
      token: process.env.token,
      trigger_id: trigger_id,
      view: view01
    }).catch(err => console.log(err))
  }
  res.send();
});
// END BLOCK: Command Handler

app.listen(5000, function() {
  console.log("[App] Server is running on port " + 5000);
});
