const { db } = require("../app");
// const cred = require("../../credentials");
const time_service = require("../services/time_service");
const { WebClient } = require('@slack/web-api'); //official slack web api
const web = new WebClient(process.env.token); //initialize
const fs = require('fs');
const update_initial = fs.readFileSync(__dirname + "/../views/update_initial.json", "utf8");
const update_maintenance = fs.readFileSync(__dirname + "/../views/update_maintenance.json", "utf8");
const update_no_maintenance = fs.readFileSync(__dirname + "/../views/update_no_maintenance.json", "utf8");

const channel = "bot-testspace";

module.exports = {
    handle_modal,
    check_db_update,
};

function handle_modal(payload){
    const {
        type,
        trigger_id,
        actions,
    } = payload;

    try{
        if(type == "shortcut"){
            web.views.open({
                token: process.env.token,
                trigger_id: trigger_id,
                view: update_initial
            });
        }
        else if(type == "block_actions"){
            actions.forEach(action => {
                if(action.action_id == "update_type"){
                    const update_type = action.selected_option.value;

                    if(update_type == "maintenance"){
                        web.views.update({
                            token: process.env.token,
                            view: update_maintenance,
                            view_id: payload.view.id
                        });
                    }
                    else if(update_type == "no_maintenance"){
                        web.views.update({
                            token: process.env.token,
                            view: update_no_maintenance,
                            view_id: payload.view.id
                        });
                    }
                }
            });
        }
        else if(type == "view_submission"){
            const values = payload.view.state.values;
            const submission = format_reminder(values);

            store_reminder(submission);
        }
    }
    catch(err){
        console.log("[App] Error handling modal: " + err);
    }
}

function format_reminder(values){
    try{
        const data = {
            update_type: values.update_type.update_type.selected_option,
            target_date: values.target_date.target_date.selected_date,
            start_time: values.start_time.start_time.selected_time,
            start_time_notification: values.start_time_notification.start_time_notification.selected_options,
            end_time: values.end_time ? values.end_time.end_time.selected_time : values.start_time.start_time.selected_time,
            end_time_notification: values.end_time_notification ? values.end_time_notification.end_time_notification.selected_options : [],
            option: values.option ? values.option.option.selected_options : [],
        };
    
        return data;
    }
    catch(err){
        console.log("[App] Error formatting reminder: " + err);
    }
}

function store_reminder(submission){
    try{
        const data = {
            update_type: submission.update_type.value,
            start_time: time_service.format_time(submission.target_date, submission.start_time),
            end_time: time_service.format_time(submission.target_date, submission.end_time),
            start_notifications: [],
            end_notifications: [],
            notification_options: [],
        };
    
        submission.start_time_notification.forEach(noti => {
            data.start_notifications.push(noti.value);
        });
    
        submission.end_time_notification.forEach(noti => {
            data.end_notifications.push(noti.value);
        });
    
        submission.option.forEach(noti => {
            data.notification_options.push(noti.value);
        });
    
        return db.collection('reminders').doc().set(data);
    }
    catch(err){
        console.log("[App] Error storing reminder: " + err);
    }
}

function check_db_update(){
    setInterval( () => {
      db.collection("reminders").orderBy("start_time", "asc").limit(1).get()
        .then(querySnapshot => {
            if(!querySnapshot.empty){
                const data = querySnapshot.docs[0].data();

                var current_time = new Date();
                var start_time = data.start_time.toDate();

                if(current_time > (start_time - 35 * 60 * 1000) && current_time < (start_time - 30 * 60 * 1000)){ // Reminder is on schedule, put on standby
                    schedule_reminder(data);
                }
                else if(current_time > (start_time - 30 * 60 * 1000)){ // Reminder expired, delete reminder
                    querySnapshot.docs[0].ref.delete();
                    console.log("[App] Deleted expired document.");
                }
            }
        })
        .catch(err => {
          console.log('[App] Error getting document: ' + err);
        });
    }, 5 * 60 * 1000);
}

function build_message(type, time = 0){
    var msg_header = "[Notice] ";
    var msg_type = "";
    var msg_time = "";

    switch(type){
        case "maintenance_start":
            msg_type = "서버 점검 시작 ";
            break;
        case "maintenance_end":
            msg_type = "서버 점검 종료 ";
            break;
        case "no_maintenance_start":
            msg_type = "패치 배포 시작 ";
            break;
        case "start_thread":
            msg_header = "[Thread] ";

            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

            msg_type = date + " 점검 쓰레드";
            break;
        case "close_pts":
            msg_type = "PTS needs to be closed.";
            break;
    }

    switch(true){
        case (time != 0):
            msg_time = time + "분 전입니다.";
            break;
        default:
            msg_time = ""
            break;
    }

    const message = msg_header + msg_type + msg_time;
    return message;
}

function schedule_reminder(data){
    data.start_notifications.forEach(option => {
        var msg_type = data.update_type + "_start";
        var message = build_message(msg_type, option);
        var msg_schedule = Date.parse(data.start_time) - (parseInt(option)) - Date.now();
        send_timed_message(channel, message, msg_schedule);
    });

    if(data.end_time != data.start_time){
        data.end_notifications.forEach(option => {
            var msg_type = "maintenance_end";
            var message = build_message(msg_type, option);
            var msg_schedule = Date.parse(data.end_time) - (parseInt(option)) - Date.now();
            send_timed_message(channel, message, msg_schedule);
        });
    }

    data.notification_options.forEach(option => {
        console.log(option);
        switch(option){
            case "option_start_thread":
                var message = build_message("start_thread");
                var msg_schedule = Date.parse(data.start_time) - (5 * 60 * 1000) - Date.now();
                send_timed_message(channel, message, msg_schedule);
                break;
            case "option_close_pts":
                var message = build_message("close_pts");
                var msg_schedule = Date.parse(data.end_time) - Date.now();
                send_timed_message(channel, message, msg_schedule);
                break;
        }
    });
}

function send_timed_message(channel, text, time){
    setTimeout(function() {
      web.chat.postMessage({
        token: process.env.token,
        channel,
        text,
        link_names: 1
      }).catch(err => console.log(err))
    }, time);
}