import * as functions from "firebase-functions";
// import { firestore } from "firebase-admin";
// import * as admin from "firebase-admin";


// Function to set the custom claims for the user
export const customClaims = functions.https.onRequest((req, res) => {

  if(req.query.password === "omni@123"){
    // const jsonData = [
    //     {
    //         "email": "praju.v@medtechsoft.co",
    //         "role": "employee",
    //         "employeeId": "MEDTE_12632",
    //         "companyId": "MTSS2772",
    //         "uid": "nbATOhCWC0NWn21DxekMlJOWBDp2"
    //     }
    
    // ];
    // const data = jsonData;  
    // console.log(data);

    // const promises = data.map(async (element: { email: any; role: any; companyId: any; employeeId: any; uid: any }) => {
    //     try {
    //         await admin.auth().setCustomUserClaims(element.uid, {
    //             role: element.role,
    //             companyId: element.companyId,
    //             employeeId: element.employeeId
    //         });
    //         console.log("Custom claims added/updated successfully for", element.uid);
    //     } catch (error) {
    //         console.error("Error setting custom claims for", element.uid, ":", error);
    //         // If you want to handle errors for individual elements, you can resolve the promise with an error message.
    //         // return `Error setting custom claims for ${element.uid}: ${error.message}`;
    //         throw error; // Rethrow the error to propagate it to the Promise.all catch block.
    //     }
    //   });
      
    //   Promise.all(promises)
    //     .then(() => {
    //       console.log("All custom claims added/updated successfully");
    //       res.send("All custom claims added/updated successfully");
    //     })
    //     .catch((error) => {
    //       console.error("Error setting custom claims:", error);
    //       res.status(500).send("Error setting custom claims");
    //     });
      
  res.send("Custom claims addded successfully");
  }
});

