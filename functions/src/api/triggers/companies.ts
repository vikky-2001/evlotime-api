import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";

export const updateCompaniesCollection = functions.firestore.document("users/{userId}").onUpdate(async (snap) => {

  const beforeValue = snap.before.data();
  const newValue = snap.after.data();
  const role = snap.before.data().role;
  if (role === "org_admin") {
    if (beforeValue != newValue) {
      const uid = snap.before.data().uid;
      console.log(uid);
      const collection = firestore().collection("companies");
      const snapshot = await collection.where("uid", "==", uid).get();
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      snapshot.forEach(async doc => {
        const docId = doc.id;
        const employeeCount = doc.data().employeeCount;
        firestore().collection("companies").doc(docId).update(
          newValue
        );
        firestore().collection("companies").doc(docId).update(
          {
            status: "active",
            employeeCount: employeeCount
          }
        );
      });
    }
  }
});

// when there is a update in montly leave allowance field then go and change the value for all employees in employees collection
export const updateAllEmployeeCollection = functions.firestore.document("companies/{companiesId}").onUpdate(async (snap) => {
  const beforeValue = snap.before.data();
  const newValue = snap.after.data();
  const companyId = snap.after.data().companyId;
  if (beforeValue.monthlyLeaveAllowance != newValue.monthlyLeaveAllowance) {
    const uid = snap.before.data().uid;
    console.log(uid);
    const collection = firestore().collection("employees");
    const snapshot = await collection.where("companyId", "==", companyId).get();
    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }
    snapshot.forEach(async doc => {
      const docId = doc.id;
      const data = doc.data();
      if (newValue != data) {
        firestore().collection("employees").doc(docId).update({
          monthlyLeaveAllowance: newValue.monthlyLeaveAllowance,
        });
      }
    });
  }
});
