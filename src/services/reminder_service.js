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
        console.log("[App] Reminder error: " + err);
    }
}

function format_reminder(values){
    const data = {
        update_type: values.update_type.update_type.selected_option,
        target_date: values.target_date.target_date.selected_date,
        start_time: values.start_time.start_time.selected_time,
        start_time_notification: values.start_time_notification.start_time_notification.selected_options,
        end_time: values.end_time.end_time.selected_time,
        end_time_notification: [],
        option: [],
    };

    if(values.end_time_notification){
        data.end_time_notification = values.end_time_notification.end_time_notification.selected_options;
    }

    if(values.option){
        data.option = values.option.option.selected_options;
    }

    return data;
}

function store_reminder(submission){
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

function check_db_update(){
    setInterval( () => {
      db.collection("reminders").orderBy("start_time", "asc").limit(1).get()
        .then(querySnapshot => {
            if(!querySnapshot.empty){
                const doc = querySnapshot.docs[0].data();

                var current_time = new Date();
                const { start_time } = doc;

                // console.log("Current time: " + current_time);
                // console.log("Start time: " + start_time.toDate());
                // console.log("Is it before scheduled start time?" + (current_time < (start_time - 30 * 60 * 1000)));

                // if(current_time > (start_time - 35 * 60 * 1000) && current_time < (start_time - 30 * 60 * 1000)){ //date is today and start time is within 35 minutes
                //     schedule_reminder(doc);
                // }
                // else if(current_time > (start_time - 30 * 60 * 1000)){ // Reminder date is past the target date
                //     doc.delete();
                // }
            }


            
        })
        .catch(err => {
          console.log('[App] Error getting document: ', err);
        });
    }, 0.5 * 60 * 1000);
}

function schedule_reminder(doc){
    var maintenance_start_message = "[Notice] 서버 점검 시작 ";
    var maintenance_end_message = "[Notice] 서버 점검 종료 ";
    var no_maintenance_start_message = "[Notice] 패치 배포 시작 ";
    var start_thread_message = "[Thread] " + doc.target_date.target_date.selected_date + " 점검 쓰레드";
    var close_pts_message = "[Notice] PTS를 닫아야 합니다."

    if(doc.update_type.update_type.selected_option.value == "maintenance"){
        doc.start_time_notification.start_time_notification.selected_options.forEach(option => {
                if(option.value > 0){
                    send_timed_message(channel, maintenance_start_message + option.value + "분 전 입니다.", option.value * 60 * 1000);
                }
                else if(option.value == 0){
                    send_timed_message(channel, maintenance_start_message, option.value * 60 * 1000);
                }
        });
        doc.end_time_notification.end_time_notification.selected_options.forEach(option => {
                if(option.value > 0){
                    send_timed_message(channel, maintenance_end_message + option.value + "분 전 입니다.", option.value * 60 * 1000);
                }
                else if(option.value == 0){
                    send_timed_message(channel, maintenance_end_message, option.value * 60 * 1000);
                }
        });
    }
    else if(doc.update_type.update_type.selected_option.value == "no_maintenance"){
        doc.start_time_notification.start_time_notification.selected_options.forEach(option => {
                if(option.value > 0){
                    send_timed_message(channel, no_maintenance_start_message + option.value + "분 전 입니다.", option.value * 60 * 1000);
                }
                else if(option.value == 0){
                    send_timed_message(channel, no_maintenance_start_message, option.value * 60 * 1000);
                }
        });
    }

    doc.option.option.selected_options.forEach(option => {
        switch(option.value){
            case "option_start_thread":
                send_timed_message(channel, start_thread_message, 5 * 60 * 1000);
                break;
            case "option_close_pts":
                send_timed_message(channel, close_pts_message, 0 * 60 * 1000);
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