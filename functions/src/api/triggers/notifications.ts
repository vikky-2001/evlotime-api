import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
// import {time_entry} from "./firebaseClient";

export const createNotificationCollection = functions.firestore.document("employees/{employeesId}").onCreate((snap) => {
    // const uid = snap.data().uid;
    const newValue = snap.data();
    const newId = newValue.uid;
    const companyID = newValue.companyId;
    const country = newValue.country;
    const fcmToken = newValue.fcmToken;
    const status = newValue.status;
    const role = newValue.role;
    const employeeID = newValue.employeeId;
    const firstName = newValue.firstName;
    const lastName = newValue.lastName;

    if(role != "org_admin"){
        firestore().collection("notifications").doc(newId).set({
               companyId: companyID,
               country: country?country:"",
               fcmToken: fcmToken?fcmToken:"",
               status: status?status:"",
               employeeId: employeeID,
              //  timeEntryStatus: "Not added",
               totalMinutes: 0,
               firstName: firstName,
               lastName: lastName,
               notificationStatus: false
        });
      }
});

export const updateNotificationCollection = functions.firestore.document("employees/{employeesId}").onUpdate(async(snap) => {
    const beforeData = snap.before.data();
    const afterData = snap.after.data();
      if(beforeData.fcmToken != afterData.fcmToken || beforeData.country != afterData.country || beforeData.status != afterData.status ||beforeData.firstName != afterData.firstName || beforeData.lastName != afterData.lastName){
            const beforeEmployeeID = snap.before.data().employeeId;
            const country = snap.after.data().country;
            const fcmToken = snap.after.data().fcmToken;
            const status = snap.after.data().status;
            const firstName = snap.after.data().firstName;
            const lastName = snap.after.data().lastName;
            const collection = firestore().collection("notifications");
            const snapshot = await collection.where("employeeId", "==", beforeEmployeeID).get();
            if (snapshot.empty) {
                console.log("No matching documents.");
                return;
              }
              snapshot.forEach(async doc => {
                const docId = doc.id;
                //  Id = doc.data().companyId;
                firestore().collection("notifications").doc(docId).update({
                  fcmToken: fcmToken != null || "" || undefined? fcmToken: beforeData.fcmToken,
                  country: country != null || "" || undefined? country: beforeData.country,
                  status: status != null || "" || undefined? status: beforeData.status,
                  firstName : firstName != null || "" || undefined? firstName : beforeData.firstName,
                  lastName : lastName != null || "" || undefined? lastName : beforeData.lastName,
                });
              });
    }
});

const time_entry = "time-entry";
export const updateTimeEntryStatus = functions.firestore.document(time_entry + "/{id}").onCreate(async(snap) => {
    const newValue = snap.data();
    // const companyId = newValue.companyId;
    const dayOfYear = newValue.dayOfYear;
    console.log(dayOfYear);
    const now:any = new Date();
    const start:any = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const todayDayOfYear = Math.floor(diff / oneDay);
    console.log("Day of year: " + todayDayOfYear);
    const minutes = snap.data().minutes;
    const employeeId = newValue.employeeId;
    console.log(employeeId);
    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("employeeId", "==", employeeId).get();
    if (snapshots.empty) {
    console.log("No document");
    }
    snapshots.forEach(async doc => {
        const docId = doc.id;
        const totalMinutes = doc.data().totalMinutes; //already submitted minutes
        console.log(totalMinutes);
        const overAllTotalMinutes = totalMinutes + minutes;
        console.log(overAllTotalMinutes);
        if(dayOfYear === todayDayOfYear){
          if(overAllTotalMinutes === 480){
            console.log(overAllTotalMinutes);
              const collection = firestore().collection("notifications").doc(docId);
              collection.update({
                // timeEntryStatus: "Added",
                totalMinutes: overAllTotalMinutes
              });
          }
          else{
            const collection = firestore().collection("notifications").doc(docId);
            collection.update({
              timeEntryStatus: "Not added",
              totalMinutes: overAllTotalMinutes
            });
          }
      }
      else{
        return;
      }
    });
  });

  export const updateTimeEntry = functions.firestore.document(time_entry + "/{id}").onUpdate(async(snap) => {
    const value = snap.before.data();
    const newValue = snap.after.data();
    // const id = snap.id;
    const employeeId = value.employeeId;
    const now = new Date().getTime(); 
    const start = new Date(new Date(now).getFullYear(), 0, 0);
    const diff =  now - Number(start) ;
    const oneDay = 1000 * 60 * 60 * 24;
    const todayDayOfYear = Math.floor(diff / oneDay);
    console.log("Day of year: " + todayDayOfYear);

    if(value.minutes != newValue.minutes){
      console.log("Not Equal");
    if(value.dayOfYear === todayDayOfYear){
      console.log("Equal");
        const collections = firestore().collection("notifications");
        const snapshots = await collections.where("employeeId", "==", employeeId).get();
        if (snapshots.empty) {
        console.log("No document");
        }
        snapshots.forEach(async doc => {
          const docMins = doc.data().totalMinutes;
          const sub = docMins - value.minutes;
          const total = sub + newValue.minutes;
          console.log(total);
          const id1 = doc.id;
          const collection = firestore().collection("notifications").doc(id1);
          collection.update({
            // timeEntryStatus: "Not added",
            totalMinutes: total
          });
        }); 
    }
  }
  });

  export const deleteTimeEntry = functions.firestore.document(time_entry + "/{id}").onDelete(async(snap) => {
    const value = snap.data();
    // const id = snap.id;
    const employeeId = value.employeeId;
    const now = new Date().getTime();
    const start = new Date(new Date(now).getFullYear(), 0, 0);
    const diff =  now - Number(start) ;
    const oneDay = 1000 * 60 * 60 * 24;
    const todayDayOfYear = Math.floor(diff / oneDay);
    console.log("Day of year: " + todayDayOfYear);

    if(todayDayOfYear === value.dayOfYear){
        const totalMinutes = value.minutes;
        const collections = firestore().collection("notifications");
        const snapshots = await collections.where("employeeId", "==", employeeId).get();
        if (snapshots.empty) {
        console.log("No document");
        }
        snapshots.forEach(async doc => {
          const docMins = doc.data().totalMinutes;
          const total = docMins - totalMinutes;
          const id1 = doc.id;
          const collection = firestore().collection("notifications").doc(id1);
          collection.update({
            // timeEntryStatus: "Not added",
            totalMinutes: total
          });
        }); 
    }
  });




