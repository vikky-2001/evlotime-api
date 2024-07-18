import * as functions from "firebase-functions";
import sgMail from "@sendgrid/mail";
import { firestore } from "firebase-admin";
// import { firestore } from "firebase-admin";
// import { email } from "api/endpoints";
//  import * as admin from "firebase-admin";
//  admin.initializeApp();

const Cryptr = require("cryptr");
const cryptr = new Cryptr("v1k4a1");

const API_KEY = "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";
sgMail.setApiKey(API_KEY);


     export const createemail = functions.firestore.document("invitation/{invitationId}").onCreate((snap) => {
        const firebaseProjectId = process.env.GCLOUD_PROJECT;
        const newValue = snap.data();
        console.log("new invitation created for",newValue.email);
        const email = newValue.email;
        console.log(email);
        const role = newValue.role;
        console.log(role);
        const docId = snap.id;
        const companyName = snap.data().companyName;
        const name = [snap.data().firstName + " " + snap.data().lastName];
        //For timestamp
        const timestamp = new Date();
        const data = [`${email},${role},${timestamp}`];
        //Encrypting the data
        const encryptedString = cryptr.encrypt(data);
        console.log(encryptedString);
        //Adding the invite string and timestamp to the invitation collection
        const collection = firestore().collection("invitation").doc(docId);
        collection.update({
                inviteString: encryptedString,
                timeStamp: timestamp,
        });
        let url;
        if(firebaseProjectId === "evlotime--dev"){
          url = "https://evlotime-test.web.app/changepassword";
        }
        else if(firebaseProjectId === "evlotime-demo"){
          url = "https://evlotime-demo.web.app/changepassword";
        }
        else{
          url = "https://evlotime.web.app/changepassword";
        }
        //sending mail using sendgrid
        const msg = {
            to: email,
            from: "support@evlotime.com",
            subject: "EvloTime",
            templateId: "d-fbb87b35965448c5a089c0f08d0f9135",
            dynamic_template_data: {
              subject: "EvloTime",
              invitationCode: `${url}/${encryptedString}`,
              name: companyName?companyName:name
            },
        };
        sgMail
            .send(msg)
            .then(async()=>{
              console.log("Email sent");
              //if the role is org admin then update the status to invited after mail is sent
              if(role === "org_admin"){
              const collection = firestore().collection("companies");
              const snapshot = await collection.where("email", "==", email).get();
              if (snapshot.empty) {
                console.log("No matching documents.");
                return;
              }
              snapshot.forEach(async doc => {
                const docId = doc.id;
                console.log(docId);
                firestore().collection("companies").doc(docId).update({
                  status: "Invited"
                });
                
                setTimeout(async ()=>{
                    const collection = firestore().collection("companies");
                    const snapshot = await collection.where("email", "==", email).get();
                    if (snapshot.empty) {
                      console.log("No matching documents.");
                      return;
                    }
                    snapshot.forEach(doc => {
                      const docId = doc.id;
                      const data = doc.data();
                      const status = data.status;
                      console.log(status);
                      console.log(docId);
                      if(status === "Invited"){
                        firestore().collection("companies").doc(docId).update({
                          status: "Pending"
                        });
                      }
                });
              },86400000);
            });
          }
          if(role === "manager"){
              firestore().collection("invitation").doc(docId).update({
                status: "Invited"
              });
              
              setTimeout(async ()=>{
                  const collection = firestore().collection("invitation");
                  const snapshot = await collection.where("email", "==", email).get();
                  if (snapshot.empty) {
                    console.log("No matching documents.");
                    return;
                  }
                  snapshot.forEach(doc => {
                    const docId = doc.id;
                    const data = doc.data();
                    const status = data.status;
                    console.log(status);
                    console.log(docId);
                    if(status === "Invited"){
                      firestore().collection("invitation").doc(docId).update({
                        status: "Pending"
                      });
                    }
              });
            },86400000);
        }
          })
            .catch((error: any)=> {
              console.log(error.message);
              console.log("something went wrong");
            });
    });

    export const resendEmail = functions.firestore.document("invitation/{invitationId}").onUpdate((snap) => {
            const firebaseProjectId = process.env.GCLOUD_PROJECT;
            const oldValue = snap.before.data();
            const newValue = snap.after.data();
            console.log("new invitation created for",newValue.email);
            const email = newValue.email;
            const role = newValue.role;
            const docId = snap.after.id;
            const companyName = snap.before.data().companyName;
            const name = [snap.before.data().firstName + " " + snap.before.data().lastName];
            if(newValue.resendEmail === true && oldValue.resendEmail != true){
            //For timestamp
            const timestamp = new Date();
            const data = [`${email},${role},${timestamp}`];
            //Encrypting the data
            const encryptedString = cryptr.encrypt(data);
            //Adding the invite string and timestamp to the invitation collection
            const collection = firestore().collection("invitation").doc(docId);
            collection.update({
                    inviteString: encryptedString,
                    timeStamp: timestamp,
            });
            let url;
            if(firebaseProjectId === "evlotime--dev"){
              url = "https://evlotime-test.web.app/changepassword";
            }
            else if(firebaseProjectId === "evlotime-demo"){
              url = "https://evlotime-demo.web.app/changepassword";
            }
            else{
              url = "https://evlotime.web.app/changepassword";
            }
            //sending mail using sendgrid
            const msg = {
                to: email,
                from: "support@evlotime.com",
                subject: "EvloTime",
                templateId: "d-fbb87b35965448c5a089c0f08d0f9135",
                dynamic_template_data: {
                  subject: "EvloTime",
                  invitationCode: `${url}/${encryptedString}`,
                  name: companyName?companyName:name
                },
            };
            sgMail
                .send(msg)
                .then(async()=>{
                  console.log("Email sent");
                  firestore().collection("invitation").doc(docId).update({
                    resendEmail: false
                  });
                  //if the role is org admin then update the status to invited after mail is sent
                  if(role === "org_admin"){
                  const collection = firestore().collection("companies");
                  const snapshot = await collection.where("email", "==", email).get();
                  if (snapshot.empty) {
                    console.log("No matching documents.");
                    return;
                  }
                  snapshot.forEach(async doc => {
                    const docId = doc.id;
                    console.log(docId);
                    firestore().collection("companies").doc(docId).update({
                      status: "Invited"
                    });
                    
                    setTimeout(async ()=>{
                        const collection = firestore().collection("companies");
                        const snapshot = await collection.where("email", "==", email).get();
                        if (snapshot.empty) {
                          console.log("No matching documents.");
                          return;
                        }
                        snapshot.forEach(doc => {
                          const docId = doc.id;
                          const data = doc.data();
                          const status = data.status;
                          console.log(status);
                          console.log(docId);
                          if(status === "Invited"){
                            firestore().collection("companies").doc(docId).update({
                              status: "Pending"
                            });
                          }
                    });
                  },86400000);
                });
              }
              })
                .catch((error: any)=> {
                  console.log(error.message);
                });
              }
        });


    export const createEmployeEmail = functions.firestore.document("users/{usersId}").onCreate((snap) => {
      const newValue = snap.data();
      console.log("new invitation created for",newValue.email);
      const email = newValue.email;
      const role = newValue.role;
      const password = cryptr.decrypt(newValue.password);
      const firstName = newValue.firstName;
      const lastName = newValue.lastName;
      const name = [firstName + " " + lastName];
      if(role === "employee"){

      //sending mail using sendgrid
      const msg = {
          to: email,
          from: "support@evlotime.com",
          subject: "EvloTime",
          
          templateId: "d-59e981f17a534c3aa4455126c84aab4d",
          dynamic_template_data: {
            subject: "EvloTime",
            password: password,
            name: name
          },
      };
      sgMail
          .send(msg)
          .then(async()=>{
            console.log("Email sent");
        })
          .catch((error: any)=> {
            console.log(error.message);
          });
        }
  });



