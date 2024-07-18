import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createusers = functions.auth.user().onCreate(async (user) => {
  const currDate = new Date();
  const monthInNumber:any = currDate.toLocaleDateString("en-US", { month: "numeric"});
  console.log("Month in number" +" "+ monthInNumber);
  // const totalMonth = 12;
  // const balanceMonth =   (totalMonth - Number(monthInNumber-1) );
  // console.log("Balance Leave for employee for this year" +" "+ balanceMonth);
  const openingBalance = 0;

  const newEmail = user.email;
  const newId = user.uid;
  console.log(newEmail);
  console.log(user.uid);

  const collection = firestore().collection("invitation");
  const snapshot = await collection.where("email", "==", newEmail).get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    console.log(newEmail);
    return;
  }
  snapshot.forEach(async doc => {
    const data = doc.data();
    const id = doc.id;
    const email = data.email;
    const role = data.role;
    console.log(role);

  if(role === "org_admin"){
    const collection = firestore().collection("companies");
    const snapshot = await collection.where("email", "==", newEmail).get();
    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }
    snapshot.forEach(async doc => {
      const docId = doc.id;
      const orgCompanyID = doc.data().companyId;
      await admin.auth().setCustomUserClaims(newId, {
        role: role,
        companyId: orgCompanyID,
        multiAccountAccess: true
        });
      firestore().collection("companies").doc(docId).update({
        uid: newId,
        status: "Active",
        employeeCount: 0
      });
    });
      firestore().collection("users").doc(newId).set({
      email: email,
      role: role,
      createdAt: Date.now(),
      uid: newId
    });
      firestore().collection("employees").doc(newId).set({
      email: email,
      role: role,
      createdAt: Date.now(),
      uid: newId
    });
  }
  //If the role is manager save the email, role, companyID, uid in users and employees collection
  else if(role === "manager"){
    const companiesCollection = firestore().collection("companies");
    const companysnapshot = await companiesCollection.where("companyId", "==", data.companyId).get();

    let monthlyLeaveAllowance = "1.5";
    console.log(monthlyLeaveAllowance);
    if (companysnapshot.empty) {
      console.log("No matching documents in companies collection.");
      console.log(newEmail);
      return;
    }
    companysnapshot.forEach(async comDoc => {
      console.log(comDoc.data().monthlyLeaveAllowance);
      if(comDoc.data().monthlyLeaveAllowance != undefined){
        console.log("inside if condition");
        monthlyLeaveAllowance = comDoc.data().monthlyLeaveAllowance;
      }
    });
      console.log(monthlyLeaveAllowance);
       const companyID = data.companyId;
       const employeeID = data.employeeId;
       const firstName = data.firstName;
       const lastName = data.lastName;
      // const employeeID = Math.random().toString(36).substr(2, 8);
      firestore().collection("users").doc(newId).set({
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      companyId: companyID,
      createdAt: Date.now(),
      employeeId: employeeID,
      uid: newId,
      fcmToken: null,
      country: null,
      status: true,
      leaveBalance: `${monthlyLeaveAllowance}`,
      openingBalance: `${openingBalance}`,
      age: "",
      bloodGroup: "",
      city: "",
      cost: 0,
      costOfbillingPerhour: 0,
      createdBy: "",
      dateOfBirth:0,
      designation: "manager",
      employeeType: "",
      employmentType:"",
      experience: "",
      gender: "",
      isPasswordUpdate: false,
      joiningDate: 0,
      middleName: "",
      mobileNumber: 0,
      password: "",
      passwordUpdatedTime:0,
      photoUrl: "",
      relievingDate:0,
      reportingManagerId: "",
      state: "",
      terminationDate:0,
      updatedAt:0,
      monthlyLeaveAllowance: monthlyLeaveAllowance

    });
      firestore().collection("employees").doc(newId).set({
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      companyId: companyID,
      createdAt: Date.now(),
      employeeId: employeeID,
      uid: newId,
      fcmToken: null,
      country: null,
      status: true,
      leaveBalance: `${monthlyLeaveAllowance}`,
      age: "",
      bloodGroup: "",
      city: "",
      cost: 0,
      costOfbillingPerhour: 0,
      createdBy: "",
      dateOfBirth:0,
      designation: "manager",
      employeeType: "",
      employmentType:"",
      experience: "",
      gender: "",
      isPasswordUpdate: false,
      joiningDate: 0,
      middleName: "",
      mobileNumber: 0,
      password: "",
      passwordUpdatedTime:0,
      photoUrl: "",
      relievingDate:0,
      reportingManagerId: "",
      state: "",
      terminationDate:0,
      updatedAt:0,
    });
    firestore().collection("invitation").doc(id).update({
      status: "Active",
    });
    await admin.auth().setCustomUserClaims(newId, {
      role: role,
      companyId: companyID,
      employeeId:employeeID,
      multiAccountAccess: false
      });

      // const collection = firestore().collection("projects");
      // const snapshot = await collection.where("companyId", "==", companyID).get();
      // let assignProjectsId: any[] = [];
      // if (snapshot.empty) {
      //   console.log("No matching documents.");
      //   return;
      // }
      // snapshot.forEach(async doc => {
      //   assignProjectsId.push(doc.data().projectId);
      // });
      // firestore().collection("users").doc(newId).update({
      //   assignedProjects: assignProjectsId
      // });
  }
  else if(role === "super_admin"){
    await admin.auth().setCustomUserClaims(newId, {
      role: role,
      });
  }
  });
});

export const employeeCount = functions.firestore.document("users/{userId}").onCreate(async(snap) => {
  const role = snap.data().role;
  const companyID = snap.data().companyId;
  // const employeeID= snap.data().employeeId;
  if(role === "employee" || role === "manager"){

    const collections = firestore().collection("companies");
    const snapshots = await collections.where("companyId", "==", companyID).get();
    if (snapshots.empty) {
      console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
      const Id = doc.id;
      const EmpCount = doc.data().employeeCount;
      firestore().collection("companies").doc(Id).update(
        {
         employeeCount: EmpCount + 1
        }
        );
    });
  }
});

export const updateUsersCollection = functions.firestore.document("employees/{employeesId}").onUpdate(async(snap) => {
  const beforeValue = snap.before.data();
  const newValue = snap.after.data();
  if(beforeValue != newValue){
      const uid = snap.before.data().uid;
      console.log(uid);
      const collection = firestore().collection("users");
  const snapshot = await collection.where("uid", "==", uid).get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  snapshot.forEach(async doc => {
    const docId = doc.id;
    const data = doc.data();
    if(newValue != data){
    firestore().collection("users").doc(docId).update(
      newValue || {}
      );
    }
  });
  }
});