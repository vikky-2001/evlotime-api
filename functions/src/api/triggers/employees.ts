import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createEmployeeCollection = functions.firestore.document("users/{userId}").onCreate(async(snap) => {
    const docID = snap.data().uid;
    const role = snap.data().role;
    const companyID = snap.data().companyId;
    const employeeID= snap.data().employeeId;
    const id = snap.id;

    const currDate = new Date();
    const monthInNumber:any = currDate.toLocaleDateString("en-US", { month: "numeric"});
    console.log("Month in number" +" "+ monthInNumber);
    const totalMonth = 12;
    const balanceMonth =   (totalMonth - Number(monthInNumber-1) );
    console.log("Balance Leave for employee for this year" +" "+ balanceMonth);
    const openingBalance = 0;

    const companiesCollection = firestore().collection("companies");
    const companysnapshot = await companiesCollection.where("companyId", "==", companyID).get();

    let monthlyLeaveAllowance = "";
    if (companysnapshot.empty) {
      console.log("No matching documents in companies collection.");
      return;
    }
    companysnapshot.forEach(async comDoc => {
       monthlyLeaveAllowance = comDoc.data().monthlyLeaveAllowance;
    });

    if(role === "employee"){
      const collection1 = firestore().collection("users").doc(id);
      collection1.update({
        leaveBalance: `${monthlyLeaveAllowance}`,
        openingBalance: `${openingBalance}`,
      });

      const value = snap.data();

      const collection = firestore().collection("employees").doc(docID);
      collection.set(value);
      console.log(true);

    await admin.auth().setCustomUserClaims(docID, {
      role: role,
      companyId: companyID,
      employeeId:employeeID,
      multiAccount: false
      });
    }
    else{
      return;
    }
});

export const updateEmployeeCollection = functions.firestore.document("users/{userId}").onUpdate(async(snap) => {
    const beforeValue = snap.before.data();
    const newValue = snap.after.data();
    if(beforeValue != newValue){
        const uid = snap.before.data().uid;
        console.log(uid);
        const collection = firestore().collection("employees");
    const snapshot = await collection.where("uid", "==", uid).get();
    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }
    snapshot.forEach(async doc => {
      const docId = doc.id;
      const data = doc.data();
      if(newValue != data){
      firestore().collection("employees").doc(docId).update(
        newValue || {}
        );
      }
    });
  }
});
