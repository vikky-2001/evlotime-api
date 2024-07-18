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


describe("updating employee count", ()=>{
    let wrapped: any;
    let path: any;
    let path1: any;

    beforeAll(()=>{
        wrapped = testEnv.wrap(myfunctions.employeeCount);
    });

    test("updating employee count in companies collection", async ()=>{
            path = "users/54321";
            path1 = "companies/54321";

       const data = {email: "unittest@yopmail.com", role: "manager", companyId: "ABCDEFG"};
       const data1 = {employeeCount: 1, companyId: "ABCDEFG"};

       await admin.firestore().doc(path1).set(data1);
       const snap1 = testEnv.firestore.makeDocumentSnapshot(data1, path1);
       await wrapped(snap1);

       await admin.firestore().doc(path).set(data);
       const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
       await wrapped(snap);


    //    setTimeout(async() => {
       const companiesCollection = await admin.firestore().doc(path1).get();
       console.log(companiesCollection.exists);
       console.log(companiesCollection.data());
       expect(companiesCollection.data()!.employeeCount).toBe(data1.employeeCount + 1);
        admin.firestore().doc(path).delete(),
        admin.firestore().doc(path1).delete();
    //    }, 3000);


   });
});

// describe("create employee document from users collection", ()=>{
//     let wrapped: any;
//     let path: any;

//     beforeAll(()=>{
//         wrapped = testEnv.wrap(myfunctions.createEmployeeCollection);
//     });

//     test("create employee document from users collection", async ()=>{
//             path = "users/54321";

//        const data = {email: "unittest@yopmail.com", role: "employee", uid: "000000"};

//        await admin.firestore().doc(path).set(data);
//        const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
//        await wrapped(snap);


//        const usersCollection = await admin.firestore().doc(path).get();
//        console.log(usersCollection.exists);
//        console.log(usersCollection.data());
//        const employeeCollection = await admin.firestore().doc(data.uid).get();
//        expect(employeeCollection.data()!.exists).toBe(true);
 

//        await admin.firestore().doc(path).delete(),
//        await admin.firestore().doc(`employees/${data.uid}`).delete();   

//    });
// });

describe("adding details to notification collection from employees collection", ()=>{
    let wrapped: any;
    let path: any;
    let data: any;

    beforeAll(()=>{

        wrapped = testEnv.wrap(myfunctions.createNotificationCollection);
    });

        test("notfication trigger", async ()=>{
        path = "employees/123456789";

        data = {email: "unittest@yopmail.com", role: "manager", companyId: "ABCD", country:"India",fcmToken: "3298472dsvfiyfg", uid: "1234567", status: true, employeeId: "ABCDE"};

        await admin.firestore().doc(path).set(data);
        const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
        await wrapped(snap);

    //    setTimeout(async() => {
        const notificationCollection = await admin.firestore().doc(`notifications/${data.uid}`).get();
        console.log(notificationCollection.exists);
        console.log(notificationCollection.data());
        expect(notificationCollection.exists).toBe(true);
        admin.firestore().doc(path).delete(),
        admin.firestore().doc(`notifications/${data.uid}`).delete();
    //    }, 2000);

   });
});

describe("oncreate in time_entry collection update it in notification collection", ()=>{
    let wrapped: any;
    let path: any;
    let path1: any;
    let data: any;
    let data1: any;

    beforeAll(()=>{
        wrapped = testEnv.wrap(myfunctions.updateTimeEntryStatus);
    });

        test("oncreate in time_entry collection update it in notification collection", async ()=>{
            path = "time-entry/123456";
            path1 = "notifications/123456";
            const now:any = new Date();
            const start:any = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            const todayDayOfYear = Math.floor(diff / oneDay);

        data = {dayOfYear: todayDayOfYear, minutes: 120, employeeId: "ABCDEF", uid: "123456"};
        data1 = {companyID: "ABCD", country: "India", employeeId: "ABCDEF", timeEntryStatus: "Not Added",totalMinutes: 0, status: true, fcm_Token: "f9434390rdf"};

        await admin.firestore().doc(path1).set(data1);
        const snap1 = testEnv.firestore.makeDocumentSnapshot(data1, path1);
        await wrapped(snap1);

        await admin.firestore().doc(path).set(data);
        const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
        await wrapped(snap);
       
    //    setTimeout(async() => {
        const notificationCollection = await admin.firestore().doc(`notifications/${data.uid}`).get();
        console.log(notificationCollection.exists);
        console.log(notificationCollection.data());
        expect(notificationCollection.data()!.totalMinutes).toBe(data1.totalMinutes + data.minutes);
        admin.firestore().doc(path).delete(),
        admin.firestore().doc(path1).delete();
    //    }, 2500);

   });
});

// describe("invitation triggers", ()=>{
//     let wrapped: any;
//     let path: any;
//     let path1: any;

//     beforeAll(()=>{
//         wrapped = testEnv.wrap(myfunctions.createemail);
//     });
//     afterAll(()=>{
//     //    return admin.firestore().doc(path).delete(),
//     //     admin.firestore().doc(path1).delete();
//     });

//     test("This is test case for invitation trigger", async ()=>{
//          path = "invitation/1234567";
//          path1 = "companies/1234567";
//         const data = {email: "unittest@yopmail.com", role: "org_admin"};


//         await admin.firestore().doc(path1).set(data);
//         const snap1 = testEnv.firestore.makeDocumentSnapshot(data, path1);
//         await wrapped(snap1);

//         await admin.firestore().doc(path).set(data);
//         const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
//         await wrapped(snap);

//         const companiesCollection = await admin.firestore().doc(path1).get();
//         console.log(companiesCollection.exists);
//         console.log(companiesCollection.data());


//         const invitationCollection = await admin.firestore().doc(path).get();
//         console.log(invitationCollection.exists);
//         console.log(invitationCollection.data());

//             expect(invitationCollection.exists).toBe(true);

//             expect(companiesCollection.exists).toBe(true);
    
//             console.log(companiesCollection.data()!.status);
//             expect(companiesCollection.data()!.status).toBe("Invited");
//             admin.firestore().doc(path).delete(),
//             admin.firestore().doc(path1).delete();

//     });
// });

//    describe("resend invitation triggers", ()=>{
//     let wrapped: any;
//     let path: any;
//     let path1: any;

//     beforeAll(()=>{
//         wrapped = testEnv.wrap(myfunctions.resendEmail);
//     });
//     afterAll(()=>{
//     //    return admin.firestore().doc(path).delete(),
//     //     admin.firestore().doc(path1).delete();
//     });

//         test("This is test case for resend invitation trigger", async ()=>{
//         path = "invitation/12345678";
//         path1 = "companies/12345678";
//        const data = {email: "unittest1@yopmail.com", role: "org_admin"};
//        const resendEmailData = {resendEmail: true};

//        await admin.firestore().doc(path1).set(data);

//        await admin.firestore().doc(path).set(data);
//        const snap = testEnv.firestore.makeDocumentSnapshot(data, path);

//        await admin.firestore().doc(path).update(resendEmailData);
//        const snap1 = testEnv.firestore.makeDocumentSnapshot(resendEmailData, path);

//        const change = testEnv.makeChange(snap, snap1);
//        await wrapped(change);

//        const invitationCollection = await admin.firestore().doc(path).get();
//        console.log(invitationCollection.exists);
//        console.log(invitationCollection.data());

//        const companiesColection = await admin.firestore().doc(path1).get();

//        setTimeout(() => {
//         expect(companiesColection.exists).toBe(true);
//         expect(invitationCollection.exists).toBe(true);
//         expect(companiesColection.data()!.status).toBe("Invited");
//         admin.firestore().doc(path).delete(),
//         admin.firestore().doc(path1).delete();
//        }, 2000);


//    });
// });

// describe("invitation trigger for employees", ()=>{
//     let wrapped: any;
//     let path: any;

//     beforeAll(()=>{
//         wrapped = testEnv.wrap(myfunctions.createEmployeEmail);
//         jest.resetAllMocks();
//     });
//     afterAll(()=>{
//     //    return admin.firestore().doc(path).delete();
//     });

//    test("This is test case for invitation trigger for employee", async ()=>{
//     path = "users/123456789";
//    const data = {email: "unittest3@yopmail.com", role: "employee", password: "12345678"};

//    await admin.firestore().doc(path).set(data);
//    const snap = testEnv.firestore.makeDocumentSnapshot(data, path);
//    await wrapped(snap);

//    // get data 
//    const usersCollection = await admin.firestore().doc(path).get();
//    console.log(usersCollection.exists);
//    console.log(usersCollection.data());

//    setTimeout(() => {
//     expect(usersCollection.exists).toBe(true);
//     admin.firestore().doc(path).delete();
//    }, 2000);

//   });
// });



