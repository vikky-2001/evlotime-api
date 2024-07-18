// import { firestore } from "firebase-admin";
// import * as functions from "firebase-functions";

// export const updateEmployeeLeaves = functions.firestore.document("employee_leaves/{employee_leavesId}").onUpdate(async(snap) => {
//   const beforeStatusValue = snap.before.data().status;
//   const newStatusValue = snap.after.data().status;
//   const employeeId = snap.before.data().employeeId;
//   const companyId = snap.before.data().companyId;
//   if(beforeStatusValue != newStatusValue){
//      if(newStatusValue === "Approved"){

//       const LeaveCount:any = snap.before.data().leaveCount;
//       console.log("Before leave count" + LeaveCount);

//       console.log("No of leaves applied" + LeaveCount);
//       const collection = firestore().collection("users");
//       const snapshot = await collection.where("companyId", "==", companyId).where("employeeId", "==", employeeId).get();
//       if (snapshot.empty) {
//         console.log("No matching documents.");
//         return;
//       }
//       snapshot.forEach(async doc => {
//           const ID = doc.id;
//           const employee_leaves = doc.data().leaveBalance;
//           console.log("leaves left" +" "+ employee_leaves);
//           const balance = parseFloat(employee_leaves) - LeaveCount;
//           console.log(balance);
//           // const balance = employee_leaves - finalLeaveApplied;

//           firestore().collection("users").doc(ID).update({
//              leaveBalance : `${balance}`
//             });
//       });
//      }
//   }
// });