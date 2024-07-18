import "jest";
jest.setTimeout(40000);
import functions from "firebase-functions-test";
import * as admin from "firebase-admin";
import * as myfunctions from "../api/triggers";
admin.initializeApp();

const testEnv = functions({
    databaseURL: "https://evlotime--dev-default-rtdb.firebaseio.com",
    projectId: "evlotime--dev"
}, "./service-account.json");

describe("delete time-entry", ()=>{
   let wrapped: any;
   let path: any;
   let path1: any;

   beforeAll(()=>{

       wrapped = testEnv.wrap(myfunctions.deleteTimeEntry);
       const now = new Date().getTime();
       const start = new Date(new Date(now).getFullYear(), 0, 0);
       const diff =  now - Number(start) ;
       const oneDay = 1000 * 60 * 60 * 24;
       const todayDayOfYear = Math.floor(diff / oneDay);
       console.log("Day of year: " + todayDayOfYear);
       admin.firestore().doc("time-entry/vicky").set({email: "unittest@yopmail.com", employeeId: "MTSS-27", companyId: "MTSS", minutes: 60, dayOfYear: todayDayOfYear});
       admin.firestore().doc("notifications/vignesh").set({ employeeId: "MTSS-27", companyId: "MTSS", totalMinutes: 120});
   });
   afterAll(()=>{
   //    return admin.firestore().doc(path).delete(),
   //     admin.firestore().doc(path1).delete();
   });

   test("delete time-entry", async ()=>{
           path = "time-entry/vicky";
           path1 = "notifications/vignesh";

      const snap1 = testEnv.firestore.exampleDocumentSnapshot();
      await wrapped(snap1);

      await admin.firestore().doc(path).delete();


        const notificationCollection = await admin.firestore().doc(path1).get();
        console.log(notificationCollection.data());

       expect(notificationCollection.data()!.totalMinutes).toBe(120);
       admin.firestore().doc(path).delete();
       admin.firestore().doc(path1).delete();

  });
});