import * as functions from "firebase-functions";
import { firestore } from "firebase-admin";

exports.employeeLeavessusa = functions.pubsub.schedule("5 0 1 * *").timeZone("America/New_York").onRun(async() => {

    const collections = firestore().collection("users");
    const snapshots = await collections.where("country", "==", "USA").where("role","!=", "org_admin").get();
    if (snapshots.empty) {
      console.log("No matching documents.");
      return;
    }
    snapshots.forEach(async doc => {
        const Id = doc.id;
        const EmployeeLeaveBalance = parseFloat(doc.data().leaveBalance);
        console.log(`Employee Leave Balance ${EmployeeLeaveBalance}`);

        const currentTimestamp = new Date();
        const options = { timeZone: "'America/New_York" };
        const istTimestamp = currentTimestamp.toLocaleString("en-US", options);
        console.log(istTimestamp);
        const currentMonth = new Date(istTimestamp).getMonth() + 1;
        const monthlyLeaveAllowance = parseFloat(doc.data().monthlyLeaveAllowance) || 1.5;

        let leaveBalance: number;
        if(currentMonth !== 1){

          let FinalLeaveBalance: number;
          if(EmployeeLeaveBalance < 0){
            FinalLeaveBalance = 0;
          }
          else{
            FinalLeaveBalance =  (EmployeeLeaveBalance);
          }

          leaveBalance = FinalLeaveBalance + monthlyLeaveAllowance;
          console.log(leaveBalance);
        }
        else{
          leaveBalance = monthlyLeaveAllowance;
          console.log(leaveBalance);
        }

        const collection1 = firestore().collection("users").doc(Id);
        collection1.update({
          leaveBalance: `${leaveBalance}`
        });
    });
});

exports.employeeLeavessindia = functions.pubsub.schedule("5 0 1 * *").timeZone("IST").onRun(async() => {

    const collections = firestore().collection("users");
    const snapshots = await collections.where("country", "==", "India").where("role","!=", "org_admin").get();
    if (snapshots.empty) {
      console.log("No matching documents.");
      return;
    }
    snapshots.forEach(async doc => {
        const Id = doc.id;
        const EmployeeLeaveBalance = parseFloat(doc.data().leaveBalance);
        console.log(`Employee Leave Balance ${EmployeeLeaveBalance}`);

        const currentTimestamp = new Date();
        const options = { timeZone: "Asia/Kolkata" };
        const istTimestamp = currentTimestamp.toLocaleString("en-US", options);
        console.log(istTimestamp);
        const currentMonth = new Date(istTimestamp).getMonth() + 1;
        const monthlyLeaveAllowance = parseFloat(doc.data().monthlyLeaveAllowance) || 1.5;
        console.log("monthlyLeaveAllowance " + monthlyLeaveAllowance);

        let leaveBalance:number;
        if(currentMonth !== 1){

          let FinalLeaveBalance: number;
          if(EmployeeLeaveBalance < 0){
            FinalLeaveBalance = 0;
          }
          else{
            FinalLeaveBalance =  (EmployeeLeaveBalance);
          }

          leaveBalance = FinalLeaveBalance + monthlyLeaveAllowance;
          console.log(leaveBalance);
        }
        else{
          leaveBalance = monthlyLeaveAllowance;
          console.log(leaveBalance);
        }

        const collection1 = firestore().collection("users").doc(Id);
        collection1.update({
          leaveBalance: `${leaveBalance}`
        });
    });
});

exports.employeeOpeningBalanceLeave = functions.pubsub.schedule("0 0 1 * *").timeZone("IST").onRun(async() => {
  const collections = firestore().collection("users");
  const snapshots = await collections.where("country", "==", "India").where("role","!=", "org_admin").get();
  if (snapshots.empty) {
    console.log("No matching documents.");
    return;
  }
  snapshots.forEach(async doc => {
      const Id = doc.id;
      const EmployeeLeaveBalance = doc.data().leaveBalance;
      console.log(`Employee Leave Balance ${EmployeeLeaveBalance}`);

      let FinalLeaveBalance: number;
      if(parseFloat(EmployeeLeaveBalance) < 0){
        FinalLeaveBalance = 0;
      }
      else{
        FinalLeaveBalance = parseFloat(EmployeeLeaveBalance);
      }

      const collection1 = firestore().collection("users").doc(Id);

      const currentTimestamp = new Date();
      const options = { timeZone: "Asia/Kolkata" };
      const istTimestamp = currentTimestamp.toLocaleString("en-US", options);
      console.log(istTimestamp);
      const currentMonth = new Date(istTimestamp).getMonth() + 1;
      console.log("CurrentMonth " + currentMonth );

      if(currentMonth !== 1){
        collection1.update({
          openingBalance: `${FinalLeaveBalance}`
        });
      }
      else{
        collection1.update({
          openingBalance: "0"
        });
      }

  });
});

exports.employeeOpeningBalanceLeaveUSA = functions.pubsub.schedule("0 0 1 * *").timeZone("America/New_York").onRun(async() => {
  const collections = firestore().collection("users");
  const snapshots = await collections.where("country", "==", "USA").where("role","!=", "org_admin").get();
  if (snapshots.empty) {
    console.log("No matching documents.");
    return;
  }
  snapshots.forEach(async doc => {
      const Id = doc.id;
      const EmployeeLeaveBalance = doc.data().leaveBalance;
      console.log(`Employee Leave Balance ${EmployeeLeaveBalance}`);

      const collection1 = firestore().collection("users").doc(Id);
      const currentTimestamp = new Date();
      const options = { timeZone: "'America/New_York" };
      const istTimestamp = currentTimestamp.toLocaleString("en-US", options);
      console.log(istTimestamp);
      const currentMonth = new Date(istTimestamp).getMonth() + 1;
      console.log("CurrentMonth " + currentMonth );

      let FinalLeaveBalance: number;
      if(parseFloat(EmployeeLeaveBalance)< 0){
        FinalLeaveBalance = 0;
      }
      else{
        FinalLeaveBalance = parseFloat(EmployeeLeaveBalance);
      }

      if(currentMonth !== 1){
        collection1.update({
          openingBalance: `${FinalLeaveBalance}`
        });
      }
      else{
        collection1.update({
          openingBalance: "0"
        });
      }

  });
});