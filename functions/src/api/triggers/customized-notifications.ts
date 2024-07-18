import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
const admin = require("firebase-admin");

export const pushNotificationTrigger = functions.firestore.document("notifications/{notificationsId}").onUpdate(async(snap) => {
    // const beforeData = snap.before.data();
    const afterData = snap.after.data();

    // If the employee did not submit the timesheet from front end they will make the notificationStatus to true in DB and if it is true then this function will trigger the notification
    if(afterData.notificationStatus === true){
            const beforeEmployeeID = snap.before.data().employeeId;
            const id = snap.before.id;
            const fcmToken = snap.after.data().fcmToken;
            const firstName = snap.after.data().firstName;
            const lastName = snap.after.data().lastName;

            const payload = {
                token: fcmToken,
                notification: {
                    title: "EvloTime",
                    body: `Hi ${firstName} ${lastName}, Please fill in your timesheets`   
                },
                data: {
                    sound: "default"
                }
            };
            admin.messaging().send(payload).then(async (response: any) => {
                console.log(`Successfully sent message for ${beforeEmployeeID}:`, response);

                // after sending the message updating the status to false
                    firestore().collection("notifications").doc(id).update({
                        notificationStatus: false
                       });
                // return {success: true};
            }).catch((error: { code: any; }) => {
                console.log(`something went wrong for ${beforeEmployeeID}`, error); 
            });
    }

    // Reject employee timesheet - notify
    if(afterData.timeSheetRejectedStatus === true){
        const beforeEmployeeID = snap.before.data().employeeId;
        const id = snap.before.id;
        const fcmToken = snap.after.data().fcmToken;
        const firstName = snap.after.data().firstName;
        const lastName = snap.after.data().lastName;

        const payload = {
            token: fcmToken,
            notification: {
                title: "EvloTime",
                body: `Hi ${firstName} ${lastName}, your timesheet has been rejected Please check and resubmit`   
            }
        };
        admin.messaging().send(payload).then(async (response: any) => {
            console.log(`Successfully sent message for ${{beforeEmployeeID}}:`, response);

            // after sending the message updating the status to false
                firestore().collection("notifications").doc(id).update({
                    timeSheetRejectedStatus: false
                   });
            // return {success: true};
        }).catch((error: { code: any; }) => {
            console.log(`something went wrong for ${beforeEmployeeID}`, error); 
        });
    }

    // Reject employee leave - notify
    if(afterData.leaveRejectedStatus === true){
        const beforeEmployeeID = snap.before.data().employeeId;
        const id = snap.before.id;
        const fcmToken = snap.after.data().fcmToken;
        const firstName = snap.after.data().firstName;
        const lastName = snap.after.data().lastName;

        const payload = {
            token: fcmToken,
            notification: {
                title: "EvloTime",
                body: `Hi ${firstName} ${lastName}, your leave request has been rejected Please check`   
            }
        };
        admin.messaging().send(payload).then(async (response: any) => {
            console.log(`Successfully sent message for ${beforeEmployeeID}:`, response);

            // after sending the message updating the status to false
                firestore().collection("notifications").doc(id).update({
                    leaveRejectedStatus: false
                   });
            // return {success: true};
        }).catch((error: { code: any; }) => {
            console.log(`something went wrong for ${beforeEmployeeID}`, error); 
        });
    }

    if(afterData.isTerminated === true){
        const beforeEmployeeID = snap.before.data().employeeId;
        const id = snap.before.id;
        const fcmToken = snap.after.data().fcmToken;
        const firstName = snap.after.data().firstName;
        const lastName = snap.after.data().lastName;

        const payload = {
            token: fcmToken,
            notification: {
                title: "EvloTime",
                body: `Hi ${firstName} ${lastName}, our system detected that you closed the Evlotime app. Please open your app to stay checkedin` 
            }
        };
        admin.messaging().send(payload).then(async (response: any) => {
            console.log(`Successfully sent message for ${beforeEmployeeID}:`, response);

            // after sending the message updating the status to false
                firestore().collection("notifications").doc(id).update({
                    isTerminated: false
                   });
            // return {success: true};
        }).catch((error: { code: any; }) => {
            console.log(`something went wrong for ${beforeEmployeeID}`, error); 
        });
    }

});