import "jest";
jest.setTimeout(30000);
import functions from "firebase-functions-test";
import * as admin from "firebase-admin";
import * as myfunctions from "../api/triggers";
admin.initializeApp();

const testEnv = functions({
    databaseURL: "https://evlotime--dev-default-rtdb.firebaseio.com",
    projectId: "evlotime--dev"
}, "./service-account.json");

describe("update employee leaves", ()=>{
   let wrapped: any;
   let path: any;
   let path1: any;

   beforeAll(()=>{

       wrapped = testEnv.wrap(myfunctions.updateCompaniesCollection);
       admin.firestore().doc("users/987654321").set({ employeeId: "MTSS-12", companyId: "MTSS", leaveBalance: 20});
   });
   afterAll(()=>{
   //    return admin.firestore().doc(path).delete(),
   //     admin.firestore().doc(path1).delete();
   });

   test("update employee leaves", async ()=>{
           path = "employee_leaves/12345678";
           path1 = "users/987654321";

      const data = {email: "unittest@yopmail.com", employeeId: "MTSS-12", companyId: "MTSS", startDate: 1658169000000, endDate: 1659547800000};
      const updateData = {status: "Approved"};


      // const snap3 = testEnv.firestore.makeDocumentSnapshot(data1, path1);
      // await wrapped(snap3);

      await admin.firestore().doc(path).set(data);
      const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
   //    await wrapped(snap);

      await admin.firestore().doc(path).update(updateData);
      const snap1 = testEnv.firestore.makeDocumentSnapshot(updateData, path);
   //    await wrapped(snap1);

      const change = testEnv.makeChange(snap, snap1);
      await wrapped(change);

      const employeeCollection = await admin.firestore().doc(path).get();
      console.log(employeeCollection.data());

      setTimeout(async() => {
       const usersCollection = await admin.firestore().doc(path1).get();
       console.log(usersCollection.exists);
       console.log(usersCollection.data());
       expect(usersCollection.data()!.leaveBalance).toBe("3");
       admin.firestore().doc(path).delete();
       admin.firestore().doc(path1).delete();
      }, 2000);



  });
});

describe("update companies collection", ()=>{
    let wrapped: any;
    let path: any;
    let path1: any;

    beforeAll(()=>{

        wrapped = testEnv.wrap(myfunctions.updateCompaniesCollection);
        admin.firestore().doc("companies/12345678").set({uid: "12345678", employeeCount: 1});
    });
    afterAll(()=>{
    //    return admin.firestore().doc(path).delete(),
    //     admin.firestore().doc(path1).delete();
    });

    test("update companies collections", async ()=>{
            path = "users/12345678";
            path1 = "companies/12345678";

       const data = {email: "unittest@yopmail.com", role: "org_admin", uid: "12345678"};
       const updateData = {status: "active", employeeCount : 1};

       await admin.firestore().doc(path).set(data);
       const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
    //    await wrapped(snap);

       await admin.firestore().doc(path).update(updateData);
       const snap1 = testEnv.firestore.makeDocumentSnapshot(updateData, path);
    //    await wrapped(snap1);

       const change = testEnv.makeChange(snap, snap1);
       await wrapped(change);

       const usersCollection = await admin.firestore().doc(path).get();
       console.log(usersCollection.data());

      //  setTimeout(async() => {
        const companiesCollection = await admin.firestore().doc(path1).get();
        console.log(companiesCollection.exists);
        console.log(companiesCollection.data());
         expect(usersCollection.data()).toStrictEqual(companiesCollection.data());
         admin.firestore().doc(path).delete();
         admin.firestore().doc(path1).delete();
      //  }, 2000);



   });
});	

describe("update employees collection", ()=>{
    let wrapped: any;
    let path: any;
    let path1: any;

    beforeAll(()=>{

        wrapped = testEnv.wrap(myfunctions.updateEmployeeCollection);

    });

    test("update employees collections", async ()=>{
            path = "users/1234567";
            path1 = "employees/1234567";

       const data = {email: "unittest0@yopmail.com", role: "org_admin", uid: "1234567"};
       const updateData = {status: "active"};

       await admin.firestore().doc("employees/1234567").set({uid: "1234567"});

       await admin.firestore().doc(path).set(data);
       const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
    //    await wrapped(snap);

       await admin.firestore().doc(path).update(updateData);
       const snap1 = testEnv.firestore.makeDocumentSnapshot(updateData, path);
    //    await wrapped(snap1);

       const change = testEnv.makeChange(snap, snap1);
       await wrapped(change);



       setTimeout(async() => {
        const usersCollection = await admin.firestore().doc(path).get();
        console.log(usersCollection.data());
        const employeesCollection = await admin.firestore().doc(path1).get();
        console.log(employeesCollection.exists);
        console.log(employeesCollection.data());
        expect(usersCollection.data()).toStrictEqual(employeesCollection.data());
        admin.firestore().doc(path).delete();
        admin.firestore().doc(path1).delete();
       }, 3000);



   });
});

describe("update users collection", ()=>{
    let wrapped: any;
    let path: any;
    let path1: any;

    beforeAll(()=>{

        wrapped = testEnv.wrap(myfunctions.updateUsersCollection);

    });

    test("update users collections", async ()=>{
            path = "employees/123456";
            path1 = "users/123456";

       const data = {email: "unittest0@yopmail.com", role: "org_admin", uid: "123456"};
       const updateData = {status: "active"};

       admin.firestore().doc("users/123456").set({uid: "123456"});

       await admin.firestore().doc(path).set(data);
       const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
    //    await wrapped(snap);

       await admin.firestore().doc(path).update(updateData);
       const snap1 = testEnv.firestore.makeDocumentSnapshot(updateData, path);
    //    await wrapped(snap1);

       const change = testEnv.makeChange(snap, snap1);
       await wrapped(change);


       setTimeout(async() => {
        const usersCollection = await admin.firestore().doc(path1).get();
        console.log(usersCollection.data());
        const employeesCollection = await admin.firestore().doc(path).get();
        console.log(employeesCollection.exists);
        console.log(employeesCollection.data());
         expect(usersCollection.data()).toStrictEqual(employeesCollection.data());

         admin.firestore().doc(path).delete();
         admin.firestore().doc(path1).delete();
       }, 2000);



   });
});

describe("update notification collection", ()=>{
    let wrapped: any;
    let path: any;
    let path1: any;

    beforeAll(()=>{

        wrapped = testEnv.wrap(myfunctions.updateNotificationCollection);
        admin.firestore().doc("notifications/1234567890").set({employeeId: "ABCDEFG", status: false});
    });

    test("update notification collections", async ()=>{
       path = "employees/1234567890";
       path1 = "notifications/1234567890";

       const data = {employeeId: "ABCDEFG", status: false, country: "India", fcmToken:"ufvewg78fr4r"};
       const updateData = {status: true, fcmToken:"ufvewg7fr4r"};

       await admin.firestore().doc(path).set(data);
       const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
    //    await wrapped(snap);

       await admin.firestore().doc(path).update(updateData);
       const snap1 = testEnv.firestore.makeDocumentSnapshot(updateData, path);
    //    await wrapped(snap1);

       const change = testEnv.makeChange(snap, snap1);
       await wrapped(change);

       const employeesCollection = await admin.firestore().doc(path).get();
       console.log(employeesCollection.data());


      setTimeout(async() => {
        const notificationCollection = await admin.firestore().doc(path1).get();
        console.log(notificationCollection.exists);
        console.log(notificationCollection.data());
         expect(notificationCollection.data()).toStrictEqual({
            country: "India",
            employeeId: "ABCDEFG",
            fcmToken: "ufvewg7fr4r",
            status: true
          });
         admin.firestore().doc("employees/1234567890").delete();
         admin.firestore().doc("notifications/1234567890").delete();
         
      }, 3000);


   });
});

describe("update notification collections2", ()=>{
    let wrapped: any;
    let path: any;
    let path1: any;

    beforeAll(()=>{
      wrapped = testEnv.wrap(myfunctions.updateTimeEntry);       
        admin.firestore().doc("notifications/web").set({ employeeId: "MTSS-27", companyId: "MTSS", totalMinutes: 0});
    });

    test("update notification collections2", async ()=>{
       path = "time-entry/web";
       path1 = "notifications/web";

       const now = new Date().getTime();
       const start = new Date(new Date(now).getFullYear(), 0, 0);
       const diff =  now - Number(start) ;
       const oneDay = 1000 * 60 * 60 * 24;
       const todayDayOfYear = Math.floor(diff / oneDay);
       console.log("Day of year: " + todayDayOfYear);
       const data = {email: "unittest@yopmail.com", employeeId: "MTSS-27", companyId: "MTSS", minutes: 60, dayOfYear: todayDayOfYear};
       const updateData = {minutes:120};

       await admin.firestore().doc(path).set(data);
       const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
    //    await wrapped(snap);

       await admin.firestore().doc(path).update(updateData);
       const snap1 = testEnv.firestore.makeDocumentSnapshot(updateData, path);
    //    await wrapped(snap1);

       const change = testEnv.makeChange(snap, snap1);
       await wrapped(change);

        const notificationCollection = await admin.firestore().doc(path1).get();
        console.log(notificationCollection.exists);
        console.log(notificationCollection.data());
        expect(notificationCollection.data()!.totalMinutes).toBe(120);
        admin.firestore().doc("time-entry/web").delete();
        admin.firestore().doc("notifications/web").delete();


   });
});
// describe("oncreate user create trigger", ()=>{
//     let wrapped: any;
//     let testUser: any;

//     beforeAll(()=>{

//          wrapped = testEnv.wrap(myfunctions.createusers);

//     });
//     afterAll(()=>{

//     });

//         test("oncreate user trigger", async ()=>{
//         await admin.firestore().doc("invitation/12345678").set({email: "unittest@yopmail.com", role:"org_admin", companyId: "ABCD", employeeId: "ABCDE"});
//         await  admin.firestore().doc("companies/12345678").set({email: "unittest@yopmail.com", role:"org_admin", companyId: "ABCD", employeeId: "ABCDE"});
            
//         testUser = {email: "unittest@yopmail.com", uid: "12345678"};
//         await wrapped(testUser);
//         console.log(testUser.email);

//         const usersCollection = await admin.firestore().doc(`users/${testUser.uid}`).get();
//         expect(usersCollection.exists).toBe(true);

//         const employeesCollection = await admin.firestore().doc(`employees/${testUser.uid}`).get();
//         expect(employeesCollection.exists).toBe(true);

//         await admin.firestore().doc("users/12345678").delete(),
//         await admin.firestore().doc("invitation/12345678").delete();
//    });
// });