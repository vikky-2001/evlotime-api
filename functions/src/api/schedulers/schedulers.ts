import * as functions from "firebase-functions";
import { firestore } from "firebase-admin";
const admin = require("firebase-admin");

exports.schedulers1 = functions.pubsub.schedule("0 0 * * 1-5").timeZone("America/New_York").onRun(async () => {

    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "USA").get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        const Id = doc.id;
        const companyId = doc.data().companyId;
        const employeeId = doc.data().employeeId;
        var datetime = new Date();
        const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
        const todayDate = datetime.toLocaleDateString("en-GB", options);
        console.log(todayDate);

        const startOfYear = new Date(datetime.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((datetime.getTime() - startOfYear.getTime()) / 86400000);
        const year = datetime.getFullYear();

        const collections = firestore().collection("holidays_USA");
        const snapshots = await collections.where("companyId", "==", companyId).where("day", "==", todayDate).get();

        if (snapshots.empty) {
            console.log("No matching documents.");
            const collections1 = firestore().collection("employee_leaves");
            const snapshots1 = await collections1.where("employeeId", "==", employeeId).where("status", "==", "Approved").where("year", "==", year).get();
            let dateRange: number[] = [];
            snapshots1.forEach(async document => {
                const currentDate = new Date(document.data().startDate);
                const endDate = new Date(document.data().endDate);

                while (currentDate <= endDate) {
                    const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000); // Calculate day of the year
                    dateRange.push(dayOfYear + 1);
                    currentDate.setDate(currentDate.getDate() + 1);
                }

            });
            console.log("dateRange" + " " + dateRange);
            console.log("dayOfYear" + " " + dayOfYear);
            if (dateRange.includes(dayOfYear) && !snapshots1.empty) {
                console.log(`${employeeId} has applied for leave today.`);
            } else {
                firestore().collection("notifications").doc(Id).update({
                    // timeEntryStatus: "Not added",
                    totalMinutes: 0
                });
            }
        }
        else {
            return;
        }
    });
});

exports.schedulers2 = functions.pubsub.schedule("0 0 * * 1-5").timeZone("IST").onRun(async () => {

    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "India").get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        const Id = doc.id;
        const companyId = doc.data().companyId;
        const employeeId = doc.data().employeeId;
        var datetime = new Date();
        const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
        const todayDate = datetime.toLocaleDateString("en-GB", options);
        console.log(todayDate);

        const startOfYear = new Date(datetime.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((datetime.getTime() - startOfYear.getTime()) / 86400000);
        const year = datetime.getFullYear();

        const collections = firestore().collection("holidays");
        const snapshots = await collections.where("companyId", "==", companyId).where("day", "==", todayDate).get();

        if (snapshots.empty) {
            console.log("No matching documents.");
            const collections1 = firestore().collection("employee_leaves");
            const snapshots1 = await collections1.where("employeeId", "==", employeeId).where("status", "==", "Approved").where("year", "==", year).get();
            let dateRange: number[] = [];
            snapshots1.forEach(async document => {
                const currentDate = new Date(document.data().startDate);
                const endDate = new Date(document.data().endDate);

                while (currentDate <= endDate) {
                    const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000); // Calculate day of the year
                    dateRange.push(dayOfYear + 1);
                    currentDate.setDate(currentDate.getDate() + 1);
                }

            });
            console.log("dateRange" + " " + dateRange);
            console.log("dayOfYear" + " " + dayOfYear);
            if (dateRange.includes(dayOfYear) && !snapshots1.empty) {
                console.log(`${employeeId} has applied for leave today.`);
            } else{
                firestore().collection("notifications").doc(Id).update({
                    // timeEntryStatus: "Not added",
                    totalMinutes: 0
                });
            }
        }
        else {
            return;
        }
    });
});

exports.schedulers3 = functions.pubsub.schedule("0 18 * * 1-5").timeZone("America/New_York").onRun(async () => {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date();
    const day = weekday[d.getDay()];
    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("totalMinutes", "<", 480).where("country", "==", "USA").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        // const Id = doc.id;
        const newValue = doc.data();
        const fcmToken = newValue.fcmToken;
        const totalMinutes = newValue.totalMinutes;
        let firstName = newValue.firstName;
        let lastName = newValue.lastName;
        const employeeId = newValue.employeeId;
        const notificationId = doc.id;
        if (firstName === null || firstName === undefined || firstName === "" || lastName === null || lastName === undefined || lastName === "") {
            const collections = firestore().collection("users");
            const snapshots = await collections.where("employeeId", "==", employeeId).get();
            if (snapshots.empty) {
                console.log("No matching documents.");
                return;
            }
            else {
                snapshots.forEach(async doc => {
                    const fName = doc.data().firstName;
                    const lName = doc.data().lastName;
                    firestore().collection("notifications").doc(notificationId).update({
                        firstName: fName,
                        lastName: lName
                    });
                    firstName = fName;
                    lastName = lName;
                });
            }
        }
        // const firstNameCheck = newValue.firstName;
        // const lastNameCheck = newValue.lastName;
        if (totalMinutes === 0) {
            const payload = {
                token: fcmToken,
                notification: {
                    title: "EvloTime",
                    body: `Hi ${firstName} ${lastName}, Please fill in your timesheet for ${day}`
                },
                data: {
                    sound: "default"
                }
            };

            admin.messaging().send(payload).then((response: any) => {
                // Response is a message ID string.
                console.log(`Successfully sent message for ${employeeId}:`, response);
                return { success: true };
            }).catch((error: { code: any; }) => {
                console.log(`something went wrong for ${employeeId}`, error);
            });
        }
        else {
            const payload = {
                token: fcmToken,
                notification: {
                    title: "EvloTime",
                    body: `Hi ${firstName} ${lastName}, Don"t forget to complete your timesheet for the day`
                },
                data: {
                    sound: "default"
                }
            };

            admin.messaging().send(payload).then((response: any) => {
                // Response is a message ID string.
                console.log(`Successfully sent message for ${employeeId}:`, response);
                return { success: true };
            }).catch((error: { code: any; }) => {
                console.log(`something went wrong for ${employeeId}`, error);
            });
        }
    });
});

exports.schedulers4 = functions.pubsub.schedule("0 18 * * 1-5").timeZone("IST").onRun(async () => {
    console.log("successfully executed");
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date();
    const day = weekday[d.getDay()];
    // console.log(`please fill in your timesheet for ${day} ${d.toLocaleDateString()}`);
    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("totalMinutes", "<", 480).where("country", "==", "India").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        const newValue = doc.data();
        const fcmToken = newValue.fcmToken;
        const totalMinutes = newValue.totalMinutes;
        let firstName = newValue.firstName;
        let lastName = newValue.lastName;
        const employeeId = newValue.employeeId;
        const notificationId = doc.id;
        if (firstName === null || firstName === undefined || firstName === "" || lastName === null || lastName === undefined || lastName === "") {
            const collections = firestore().collection("users");
            const snapshots = await collections.where("employeeId", "==", employeeId).get();
            if (snapshots.empty) {
                console.log("No matching documents.");
                return;
            }
            else {
                snapshots.forEach(async doc => {
                    const fName = doc.data().firstName;
                    const lName = doc.data().lastName;
                    firestore().collection("notifications").doc(notificationId).update({
                        firstName: fName,
                        lastName: lName
                    });
                    firstName = fName;
                    lastName = lName;
                });
            }
        }
        // const firstNameCheck = newValue.firstName;
        // const lastNameCheck = newValue.lastName;

        if (totalMinutes === 0) {
            console.log("not submitted");
            const payload = {
                token: fcmToken,
                notification: {
                    title: "EvloTime",
                    body: `Hi ${firstName} ${lastName}, Please fill in your timesheet for ${day}`
                },
                data: {
                    sound: "default"
                }
            };

            admin.messaging().send(payload).then((response: any) => {
                console.log(`Successfully sent message for ${employeeId}:`, response);
                return { success: true };
            }).catch((error: { code: any; }) => {
                console.log(`something went wrong for ${employeeId}`, error);
            });
        }
        else {
            console.log("less hours");
            const payload = {
                token: fcmToken,
                notification: {
                    title: "EvloTime",
                    body: `Hi ${firstName} ${lastName}, Don"t forget to complete your timesheet for the day`
                },
                data: {
                    sound: "default"
                }
            };

            admin.messaging().send(payload).then((response: any) => {
                console.log(`Successfully sent message for ${employeeId}:`, response);
                return { success: true };
            }).catch((error: { code: any; }) => {
                console.log(`something went wrong for ${employeeId}`, error);
            });
        }
    });
});

// Scheduler for pushing the notification for remainding the employees to CheckIn(US)
exports.USCheckInPushNotificationScheduler = functions.pubsub.schedule("*/15 * * * 1-5").timeZone("America/New_York").onRun(async () => {
    console.log("successfully executed");
    const now = new Date();
    const horusOptions: Intl.DateTimeFormatOptions = { timeZone: "America/New_York", hour: "numeric", hour12: false };
    const currentHour = new Intl.DateTimeFormat("en-GB", horusOptions).format(now);

    const minutesOptions: Intl.DateTimeFormatOptions = { timeZone: "America/New_York", minute: "2-digit" };
    const currentMinutes = new Intl.DateTimeFormat("en-GB", minutesOptions).format(now);
    // const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // const d = new Date();
    // const day = weekday[d.getDay()];
    // console.log(`please fill in your timesheet for ${day} ${d.toLocaleDateString()}`);
    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "USA").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        const newValue = doc.data();
        const fcmToken = newValue.fcmToken;
        let firstName = newValue.firstName;
        let lastName = newValue.lastName;
        const employeeId = newValue.employeeId;
        const notificationId = doc.id;
        if (firstName === null || firstName === undefined || firstName === "" || lastName === null || lastName === undefined || lastName === "") {
            const collections1 = firestore().collection("users");
            const snapshots1 = await collections1.where("employeeId", "==", employeeId).get();
            if (snapshots1.empty) {
                console.log("No matching documents in users collection.");
                return;
            }
            else {
                snapshots1.forEach(async doc => {
                    const fName = doc.data().firstName;
                    const lName = doc.data().lastName;
                    firestore().collection("notifications").doc(notificationId).update({
                        firstName: fName,
                        lastName: lName
                    });
                    firstName = fName;
                    lastName = lName;
                });
            }
        }
        // Fetching the checkin time in users collection
        const collections2 = firestore().collection("users");
        const snapshots2 = await collections2.where("employeeId", "==", employeeId).get();
        if (snapshots2.empty) {
            console.log("No matching documents in users collection.");
        }
        snapshots2.forEach(async document => {
            const checkInTime = document.data().checkInTime;
            console.log("CheckInTime" + " " + checkInTime);
            const checkInHrsAndMins = checkInTime.split(":");
            const companyId = document.data().companyId;

            const startOfYear = new Date(now.getFullYear(), 0, 0);
            const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
            const year = now.getFullYear();

            const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
            const todayDate = now.toLocaleDateString("en-GB", options);
            console.log(todayDate);
            const collections3 = firestore().collection("holidays_USA");
            const snapshots3 = await collections3.where("companyId", "==", companyId).where("day", "==", todayDate).get();
            if (snapshots3.empty) {
                console.log("No matching documents in holidays collections.");
                const collections4 = firestore().collection("employee_leaves");
                const snapshots4 = await collections4.where("employeeId", "==", employeeId).where("status", "==", "Approved").where("year", "==", year).get();
                let dateRange: number[] = [];
                console.log(dateRange);
                snapshots4.forEach(async document => {
                    const currentDate = new Date(document.data().startDate);
                    const endDate = new Date(document.data().endDate);

                    while (currentDate <= endDate) {
                        const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000); // Calculate day of the year
                        dateRange.push(dayOfYear + 1);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                });
                console.log("dateRange" + " " + dateRange);
                console.log("dayOfYear" + " " + dayOfYear);
                if (dateRange.includes(dayOfYear) && !snapshots4.empty) {
                    console.log(`${employeeId} has applied for leave today.`);
                } else{
                    console.log(`${employeeId} has not applied for any leave today.`);
                    let Minutes = (parseInt(checkInHrsAndMins[1]) + 30) % 60;
                    const newMinutes = parseInt(Minutes.toString().padStart(2, "0"));
                    const newHours = parseInt(checkInHrsAndMins[0]) + Math.floor((parseInt(checkInHrsAndMins[1]) + 30) / 60);
                    console.log("After adding 30 mins" +newHours+":"+newMinutes);
                    console.log({
                        "checkInHr":checkInHrsAndMins[0],
                        "CheckInMin": checkInHrsAndMins[1],
                        "AfterMathHr": newHours,
                        "AfterMathMin": newMinutes,
                        "CurrentHour":currentHour,
                        "currentMinutes": currentMinutes,
                        "employeeId": employeeId
                    });
                    if (parseInt(currentHour) == newHours && parseInt(currentMinutes) == newMinutes) {
                        console.log("satisfied checkinTime");
                        // Checking whether user has done checkin for today in checkin collection
                        const collections5 = firestore().collection("checkin");
                        const snapshots5 = await collections5.where("employeeId", "==", employeeId).where("dayOfYear", "==", dayOfYear).where("year", "==", year).get();
                        if (snapshots5.empty) {
                            console.log("No matching documents in checkin collections.");
                            const payload = {
                                token: fcmToken,
                                notification: {
                                    title: "EvloTime",
                                    body: `Hi ${firstName} ${lastName}, don't forget to clock in! Your check-in time started 30 minutes ago ⏰`
                                },
                                data: {
                                    sound: "default"
                                }
                            };
                            admin.messaging().send(payload).then((response: any) => {
                                // Response is a message ID string.
                                console.log(`Successfully sent message for ${employeeId}:`, response);
                                return { success: true };
                            }).catch((error: { code: any; }) => {
                                console.log(`something went wrong for ${employeeId}`, error);
                            });
                        }
                        else{
                            console.log("There is document in checkIn collection for " + employeeId);
                        }
                    }
                }
            }
            else {
                return;
            }
        });
    });
});

// Scheduler for pushing the notification for remainding the employees to CheckIn(India)
exports.INDCheckInPushNotificationScheduler = functions.pubsub.schedule("*/15 * * * 1-5").timeZone("IST").onRun(async () => {
    console.log("successfully executed");
    const now = new Date();
    const horusOptions: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false };
    const currentHour = new Intl.DateTimeFormat("en-GB", horusOptions).format(now);

    const minutesOptions: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata", minute: "2-digit" };
    const currentMinutes = new Intl.DateTimeFormat("en-GB", minutesOptions).format(now);
    // const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // const d = new Date();
    // const day = weekday[d.getDay()];
    // console.log(`please fill in your timesheet for ${day} ${d.toLocaleDateString()}`);
    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "India").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        const newValue = doc.data();
        const fcmToken = newValue.fcmToken;
        let firstName = newValue.firstName;
        let lastName = newValue.lastName;
        const employeeId = newValue.employeeId;
        const notificationId = doc.id;
        if (firstName === null || firstName === undefined || firstName === "" || lastName === null || lastName === undefined || lastName === "") {
            const collections1 = firestore().collection("users");
            const snapshots1 = await collections1.where("employeeId", "==", employeeId).get();
            if (snapshots1.empty) {
                console.log("No matching documents in users collection.");
                return;
            }
            else {
                snapshots1.forEach(async doc => {
                    const fName = doc.data().firstName;
                    const lName = doc.data().lastName;
                    firestore().collection("notifications").doc(notificationId).update({
                        firstName: fName,
                        lastName: lName
                    });
                    firstName = fName;
                    lastName = lName;
                });
            }
        }
        // Fetching the checkin time in users collection
        const collections2 = firestore().collection("users");
        const snapshots2 = await collections2.where("employeeId", "==", employeeId).get();
        if (snapshots2.empty) {
            console.log("No matching documents in users collection.");
        }
        snapshots2.forEach(async document => {
            const checkInTime = document.data().checkInTime;
            console.log("CheckInTime" + " " + checkInTime);
            const checkInHrsAndMins = checkInTime.split(":");
            const companyId = document.data().companyId;

            const startOfYear = new Date(now.getFullYear(), 0, 0);
            const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
            const year = now.getFullYear();

            const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
            const todayDate = now.toLocaleDateString("en-GB", options);
            console.log(todayDate);
            const collections3 = firestore().collection("holidays");
            const snapshots3 = await collections3.where("companyId", "==", companyId).where("day", "==", todayDate).get();
            if (snapshots3.empty) {
                console.log("No matching documents in holidays collections.");
                const collections4 = firestore().collection("employee_leaves");
                const snapshots4 = await collections4.where("employeeId", "==", employeeId).where("status", "==", "Approved").where("year", "==", year).get();
                let dateRange: number[] = [];
                console.log(dateRange);
                snapshots4.forEach(async document => {
                    const currentDate = new Date(document.data().startDate);
                    const endDate = new Date(document.data().endDate);

                    while (currentDate <= endDate) {
                        const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000); // Calculate day of the year
                        dateRange.push(dayOfYear + 1);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                });
                console.log("dateRange" + " " + dateRange);
                console.log("dayOfYear" + " " + dayOfYear);
                if (dateRange.includes(dayOfYear) && !snapshots4.empty) {
                    console.log(`${employeeId} has not applied for any leave today.`);
                } else {
                    console.log(`${employeeId} has not applied for any leave today.`);
                    let Minutes = (parseInt(checkInHrsAndMins[1]) + 30) % 60;
                    const newMinutes = parseInt(Minutes.toString().padStart(2, "0"));
                    const newHours = parseInt(checkInHrsAndMins[0]) + Math.floor((parseInt(checkInHrsAndMins[1]) + 30) / 60);
                    console.log("After adding 30 mins" +newHours+":"+newMinutes);
                    console.log({
                        "checkInHr":checkInHrsAndMins[0],
                        "CheckInMin": checkInHrsAndMins[1],
                        "AfterMathHr": newHours,
                        "AfterMathMin": newMinutes,
                        "CurrentHour":currentHour,
                        "currentMinutes": currentMinutes,
                        "employeeId": employeeId
                    });
                    console.log("CheckinHr -> " + checkInHrsAndMins[0] +"CheckinMin -> " + checkInHrsAndMins[1] + "CurrentHour -> " + currentHour + "currentMinutes" + currentMinutes + "employeeId -> " + employeeId);
                    if (parseInt(currentHour) == newHours && parseInt(currentMinutes) == newMinutes) {
                        console.log("satisfied checkinTime");
                        // Checking whether user has done checkin for today in checkin collection
                        const collections5 = firestore().collection("checkin");
                        const snapshots5 = await collections5.where("employeeId", "==", employeeId).where("dayOfYear", "==", dayOfYear).where("year", "==", year).get();
                        if (snapshots5.empty) {
                            console.log("No matching documents in checkin collections.");
                            const payload = {
                                token: fcmToken,
                                notification: {
                                    title: "EvloTime",
                                    body: `Hi ${firstName} ${lastName}, don't forget to clock in! Your check-in time started 30 minutes ago ⏰`
                                },
                                data: {
                                    sound: "default"
                                }
                            };
                            admin.messaging().send(payload).then((response: any) => {
                                // Response is a message ID string.
                                console.log(`Successfully sent message for ${employeeId}:`, response);
                                return { success: true };
                            }).catch((error: { code: any; }) => {
                                console.log(`something went wrong for ${employeeId}`, error);
                            });
                        }
                        else{
                            console.log("There is document in checkIn collection for " + employeeId);
                        }
                    }
                    else{
                        console.log("Does not staisfy the condition to push the notification");
                    }
                }
            }
            else {
                return;
            }
        });
    });
});

// Scheduler for pushing the notification for remainding the employees to CheckOut(US)
exports.USCheckOutPushNotificationScheduler = functions.pubsub.schedule("*/5 * * * 1-5").timeZone("America/New_York").onRun(async () => {
    console.log("successfully executed");
    const now = new Date();
    const horusOptions: Intl.DateTimeFormatOptions = { timeZone: "America/New_York", hour: "numeric", hour12: false };
    const currentHour = new Intl.DateTimeFormat("en-GB", horusOptions).format(now);

    const minutesOptions: Intl.DateTimeFormatOptions = { timeZone: "America/New_York", minute: "2-digit" };
    const currentMinutes = new Intl.DateTimeFormat("en-GB", minutesOptions).format(now);
    // const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // const d = new Date();
    // const day = weekday[d.getDay()];
    // console.log(`please fill in your timesheet for ${day} ${d.toLocaleDateString()}`);
    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "USA").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        const newValue = doc.data();
        const fcmToken = newValue.fcmToken;
        let firstName = newValue.firstName;
        let lastName = newValue.lastName;
        const employeeId = newValue.employeeId;
        const notificationId = doc.id;
        if (firstName === null || firstName === undefined || firstName === "" || lastName === null || lastName === undefined || lastName === "") {
            const collections1 = firestore().collection("users");
            const snapshots1 = await collections1.where("employeeId", "==", employeeId).get();
            if (snapshots1.empty) {
                console.log("No matching documents in users collection.");
                return;
            }
            else {
                snapshots1.forEach(async doc => {
                    const fName = doc.data().firstName;
                    const lName = doc.data().lastName;
                    firestore().collection("notifications").doc(notificationId).update({
                        firstName: fName,
                        lastName: lName
                    });
                    firstName = fName;
                    lastName = lName;
                });
            }
        }
        // Fetching the checkin time in users collection
        const collections2 = firestore().collection("users");
        const snapshots2 = await collections2.where("employeeId", "==", employeeId).get();
        if (snapshots2.empty) {
            console.log("No matching documents in users collection.");
        }
        snapshots2.forEach(async document => {
            const checkOutTime = document.data().checkOutTime;
            console.log("checkOutTime" + " " + checkOutTime);
            const checkOutHrsAndMins = checkOutTime.split(":");
            const companyId = document.data().companyId;
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 0);
            const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
            const year = now.getFullYear();

            const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
            const todayDate = now.toLocaleDateString("en-GB", options);
            console.log(todayDate);
            const collections3 = firestore().collection("holidays_USA");
            const snapshots3 = await collections3.where("companyId", "==", companyId).where("day", "==", todayDate).get();
            if (snapshots3.empty) {
                console.log("No matching documents in holidays collections.");
                const collections4 = firestore().collection("employee_leaves");
                const snapshots4 = await collections4.where("employeeId", "==", employeeId).where("status", "==", "Approved").where("year", "==", year).get();
                let dateRange: number[] = [];
                console.log(dateRange);
                snapshots4.forEach(async document => {
                    const currentDate = new Date(document.data().startDate);
                    const endDate = new Date(document.data().endDate);

                    while (currentDate <= endDate) {
                        const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000); // Calculate day of the year
                        dateRange.push(dayOfYear + 1);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                });
                console.log("dateRange" + " " + dateRange);
                console.log("dayOfYear" + " " + dayOfYear);
                if (dateRange.includes(dayOfYear) && !snapshots4.empty) {
                    console.log(`${employeeId} has applied for leave today.`);
                } else{
                    console.log(`${employeeId} has not applied for any leave today.`);
                    const totalMinutes = parseInt(checkOutHrsAndMins[0]) * 60 + parseInt(checkOutHrsAndMins[1]);
                    const newTotalMinutes = totalMinutes - 10;
                    const newHours = Math.floor(newTotalMinutes / 60);
                    const newMinutes = newTotalMinutes % 60;
                    console.log("Sub 10 mins" +newHours+":"+newMinutes);
                    console.log({
                        "checkOutHr":checkOutHrsAndMins[0],
                        "CheckOutMin": checkOutHrsAndMins[1],
                        "AfterMathHr": newHours,
                        "AfterMathMin": newMinutes,
                        "CurrentHour":currentHour,
                        "currentMinutes": currentMinutes,
                        "employeeId": employeeId
                    });
                    if (parseInt(currentHour) == newHours && parseInt(currentMinutes) == newMinutes) {
                        console.log("satisfied checkOutTime");
                        // Checking whether user has done checkin for today in checkin collection
                        const collections5 = firestore().collection("checkin");
                        const snapshots5 = await collections5.where("employeeId", "==", employeeId).where("dayOfYear", "==", dayOfYear).where("year", "==", year).get();
                            snapshots5.forEach(async document => {
                                console.log("CheckoutTime" + " " + document.data().checkOutTime);
                                if(document.data().checkOutTime == undefined){
                                    const payload = {
                                        token: fcmToken,
                                        notification: {
                                            title: "EvloTime",
                                            body: `Hi ${firstName} ${lastName}, you are about to timeout. Would you like to stay checked in?`
                                        },
                                        data: {
                                            sound: "default"
                                        }
                                    };
                                    admin.messaging().send(payload).then((response: any) => {
                                        // Response is a message ID string.
                                        console.log(`Successfully sent message for ${employeeId}:`, response);
                                        return { success: true };
                                    }).catch((error: { code: any; }) => {
                                        console.log(`something went wrong for ${employeeId}`, error);
                                    });
                                }
                            });
                    }
                    else{
                        console.log("Does not staisfy the condition to push the notification");
                    }
                }
            }
            else {
                return;
            }
        });
    });
});

// Scheduler for pushing the notification for remainding the employees to CheckOut(India)
exports.INDCheckOutPushNotificationScheduler = functions.pubsub.schedule("*/5 * * * 1-5").timeZone("IST").onRun(async () => {
    console.log("successfully executed");
    const now = new Date();
    const horusOptions: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false };
    const currentHour = new Intl.DateTimeFormat("en-GB", horusOptions).format(now);

    const minutesOptions: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata", minute: "2-digit" };
    const currentMinutes = new Intl.DateTimeFormat("en-GB", minutesOptions).format(now);
    // const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // const d = new Date();
    // const day = weekday[d.getDay()];
    // console.log(`please fill in your timesheet for ${day} ${d.toLocaleDateString()}`);
    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "India").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents.");
    }
    snapshots.forEach(async doc => {
        const newValue = doc.data();
        const fcmToken = newValue.fcmToken;
        let firstName = newValue.firstName;
        let lastName = newValue.lastName;
        const employeeId = newValue.employeeId;
        const notificationId = doc.id;
        if (firstName === null || firstName === undefined || firstName === "" || lastName === null || lastName === undefined || lastName === "") {
            const collections1 = firestore().collection("users");
            const snapshots1 = await collections1.where("employeeId", "==", employeeId).get();
            if (snapshots1.empty) {
                console.log("No matching documents in users collection.");
                return;
            }
            else {
                snapshots1.forEach(async doc => {
                    const fName = doc.data().firstName;
                    const lName = doc.data().lastName;
                    firestore().collection("notifications").doc(notificationId).update({
                        firstName: fName,
                        lastName: lName
                    });
                    firstName = fName;
                    lastName = lName;
                });
            }
        }
        // Fetching the checkin time in users collection
        const collections2 = firestore().collection("users");
        const snapshots2 = await collections2.where("employeeId", "==", employeeId).get();
        if (snapshots2.empty) {
            console.log("No matching documents in users collection.");
        }
        snapshots2.forEach(async document => {
            const checkOutTime = document.data().checkOutTime;
            console.log("checkOutTime" + " " + checkOutTime);
            const checkOutHrsAndMins = checkOutTime.split(":");
            const companyId = document.data().companyId;
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 0);
            const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
            const year = now.getFullYear();

            const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
            const todayDate = now.toLocaleDateString("en-GB", options);
            console.log(todayDate);
            const collections3 = firestore().collection("holidays");
            const snapshots3 = await collections3.where("companyId", "==", companyId).where("day", "==", todayDate).get();
            if (snapshots3.empty) {
                console.log("No matching documents in holidays collections.");
                const collections4 = firestore().collection("employee_leaves");
                const snapshots4 = await collections4.where("employeeId", "==", employeeId).where("status", "==", "Approved").where("year", "==", year).get();
                let dateRange: number[] = [];
                console.log(dateRange);
                snapshots4.forEach(async document => {
                    const currentDate = new Date(document.data().startDate);
                    const endDate = new Date(document.data().endDate);

                    while (currentDate <= endDate) {
                        const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000); // Calculate day of the year
                        dateRange.push(dayOfYear + 1);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                });
                console.log("dateRange" + " " + dateRange);
                console.log("dayOfYear" + " " + dayOfYear);
                if (dateRange.includes(dayOfYear) && !snapshots4.empty) {
                    console.log(`${employeeId} has applied for leave today.`);
                } else {
                    console.log(`${employeeId} has not applied for any leave today.`);
                    const totalMinutes = parseInt(checkOutHrsAndMins[0]) * 60 + parseInt(checkOutHrsAndMins[1]);
                    const newTotalMinutes = totalMinutes - 10;
                    const newHours = Math.floor(newTotalMinutes / 60);
                    const newMinutes = newTotalMinutes % 60;
                    console.log("Sub 10 mins" +newHours+":"+newMinutes);
                    console.log({
                        "checkOutHr":checkOutHrsAndMins[0],
                        "CheckOutMin": checkOutHrsAndMins[1],
                        "AfterMathHr": newHours,
                        "AfterMathMin": newMinutes,
                        "CurrentHour":currentHour,
                        "currentMinutes": currentMinutes,
                        "employeeId": employeeId
                    });
                    if (parseInt(currentHour) == newHours && parseInt(currentMinutes) == newMinutes) {
                        console.log("satisfied checkOutTime");
                        // Checking whether user has done checkin for today in checkin collection
                        const collections5 = firestore().collection("checkin");
                        const snapshots5 = await collections5.where("employeeId", "==", employeeId).where("dayOfYear", "==", dayOfYear).where("year", "==", year).get();
                            snapshots5.forEach(async document => {
                                console.log("CheckoutTime" + " " + document.data().checkOutTime);
                                if(document.data().checkOutTime == undefined){
                                    const payload = {
                                        token: fcmToken,
                                        notification: {
                                            title: "EvloTime",
                                            body: `Hi ${firstName} ${lastName}, you are about to timeout. Would you like to stay checked in?`
                                        },
                                        data: {
                                            sound: "default"
                                        }
                                    };
                                    admin.messaging().send(payload).then((response: any) => {
                                        // Response is a message ID string.
                                        console.log(`Successfully sent message for ${employeeId}:`, response);
                                        return { success: true };
                                    }).catch((error: { code: any; }) => {
                                        console.log(`something went wrong for ${employeeId}`, error);
                                    });
                                }
                            });
                    }
                    else{
                        console.log("Does not staisfy the condition to push the notification");
                    }
                }
            }
            else {
                return;
            }
        });

    });
});