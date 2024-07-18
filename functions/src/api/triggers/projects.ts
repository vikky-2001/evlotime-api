// import { firestore } from "firebase-admin";
// import * as functions from "firebase-functions";

// export const updateAssignProjectsForManagers = functions.firestore.document("projects/{projectsId}").onCreate(async(snap) => {

//     const projectId : any[] = snap.data().projectId;
//     const companyId = snap.data().companyId;

//     const collection = firestore().collection("users");
//     const snapshot = await collection.where("companyId", "==", companyId).where("role", "==", "manager").get();
//     snapshot.forEach(async doc => {
//         const id = doc.id;
//         const projectData:any[] = doc.data().assignedProjects;
//         if(projectData != null){
//             projectData.push(projectId);
//             firestore().collection("users").doc(id).update({
//                 assignedProjects: firestore.FieldValue.arrayUnion(projectId)
//               });
//         }
//         else{
//             firestore().collection("users").doc(id).update({
//                 assignedProjects: [projectId]
//               });
//         }


//       });



// });
