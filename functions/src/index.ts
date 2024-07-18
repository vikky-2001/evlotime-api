// import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// import { UserRecord } from "firebase-functions/lib/providers/auth";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// exports.createTeamMember = functions.firestore
//   .document("teamProfile/{teamId}/teamMemberList/{newUserId}")
//   .onCreate(async (snap) => {
//     const id: string = snap.data().id;
//     const email: string = snap.data().email;
//     const teamId: string = snap.data().teamId;

//     const newUser: UserRecord = await admin.auth().createUser({
//       uid: id,
//       email: email,
//       password: "123456789",
//     });

//     await admin.firestore().doc(`userProfile/${id}`).set({
//       email: email,
//       id: id,
//       teamId: teamId,
//       teamAdmin: false,
//     });

//     return newUser;
//   });



export * from "./api";
