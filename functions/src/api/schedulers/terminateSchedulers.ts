import * as functions from "firebase-functions";
import { firestore } from "firebase-admin";
const admin = require("firebase-admin");

// Scheduler for pushing the notification for remainding the employees to CheckOut(USA)
exports.USAppTerminateNotificationScheduler = functions.pubsub.schedule("*/5 * * * 1-5").timeZone("America/New_York").onRun(async () => {
    console.log("successfully executed");

    const currentTym = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const currentTime = new Date(currentTym).getTime();

    const start = new Date(new Date(currentTime).getFullYear(), 0, 0);
    const diff = currentTime - Number(start);
    const oneDay = 1000 * 60 * 60 * 24;
    const todayDayOfYear = Math.floor(diff / oneDay);
    const currentYear = new Date(currentTime).getFullYear();
    console.log("Day of year: " + todayDayOfYear);
    console.log("year " + currentYear);

    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "USA").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents in notification Collection.");
    }
    snapshots.forEach(async doc => {
        const newValue = doc.data();
        // const notifiCollectionId = doc.id;
        const lastUpdatedTime = newValue.lastUpdatedTime;
        const isCheckout = newValue.isCheckout;

        const updateDate = new Date(lastUpdatedTime);
        const currentDate = new Date(currentTime);

        // If updated timestamp is today then do the push notification after 15mins when the app is terminated
        if (currentDate.getDate() === updateDate.getDate() && currentDate.getMonth() === updateDate.getMonth() && currentDate.getFullYear() === updateDate.getFullYear()) {
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
                const checkin = document.data().checkInTime;
                const checkout = document.data().checkOutTime;
                console.log("checkInTime, CheckOutTime " + checkin +" "+checkout);
                const inTime = checkin.split(":");
                const outTime = checkout.split(":");
                const checkInTime = new Date();
                checkInTime.setHours(inTime[0], inTime[1], 0); // Set check-in time to 7:00 AM
                checkInTime.toLocaleTimeString("en-US", { timeZone: "America/New_York" });
                const checkOutTime = new Date();
                checkOutTime.setHours(outTime[0], outTime[1], 0); // Set check-out time to 3:00 PM
                checkOutTime.toLocaleTimeString("en-US", { timeZone: "America/New_York" });

                console.log("currentTime " + new Date(currentTime));
                console.log("checkInTime " + checkInTime);
                console.log("checkOutTime " + checkOutTime);

            if (currentTime >= checkInTime.getTime() && currentTime <= checkOutTime.getTime()) {
                console.log("Current time is within the specified range.");
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
                    } else {
                        console.log(`${employeeId} has not applied for any leave today.`);

                        const updateDate = new Date(lastUpdatedTime).toLocaleString("en-US", { timeZone: "America/New_York" });
                        const updatedTime = new Date(updateDate).getTime();
                        // Checking whether the time difference is greater than 15mins and less than 20mins
                        const timeDifference = currentTime - updatedTime;
                        const minutesDifference = Math.abs(timeDifference / (1000 * 60));
                        console.log(`The time difference is ${minutesDifference} minutes.`);
                        if (minutesDifference >= 5 && minutesDifference <= 10 && isCheckout === false) {
                            console.log("The time difference is between 5 and 10 minutes.");
                            const payload = {
                                token: fcmToken,
                                notification: {
                                    title: "EvloTime",
                                    body: `Hello ${firstName} ${lastName}, Our system detected that you closed the Evlotime app. This is a friendly reminder to open your app to stay checkedin.`
                                },
                                data: {
                                    sound: "default"
                                }
                            };

                            admin.messaging().send(payload).then(async (response: any) => {
                                            // Response is a message ID string.
                            console.log(`Successfully sent message for ${employeeId}:`, response);
                            return { success: true };
                            }).catch((error: { code: any; }) => {
                            console.log(`something went wrong for ${employeeId}`, error);
                            });
                        }
                        else if (minutesDifference >= 20 && minutesDifference <= 25 && isCheckout === false) {
                            console.log("The time difference is between 20 and 25 minutes.");

                            const collections = firestore().collection("checkin");
                            const snapshots = await collections.where("employeeId", "==", employeeId).where("dayOfYear", "==", todayDayOfYear).where("year", "==", currentYear).get();
                            if (snapshots.empty) {
                                console.log("No matching documents in CheckIn Collection.");
                            }
                            else {
                                snapshots.forEach(async document => {
                                    const CheckInCollectionId = document.id;
                                    const checkOutTime = document.data().checkOutTime;
                                    const checkInTime = document.data().checkInTime;
                                    const checkInLocation = document.data().checkInLocation;
                                    if (checkOutTime == undefined) {
                                        const timeDifference = lastUpdatedTime - checkInTime;
                                        const minutesDifference = Math.floor(timeDifference / (1000 * 60));
                                        const CheckInCollection = firestore().collection("checkin").doc(CheckInCollectionId);
                                        CheckInCollection.update({
                                            checkOutTime: lastUpdatedTime,
                                            checkOutLocation: checkInLocation,
                                            isCheckIn: false,
                                            workedTimeInMin: minutesDifference,
                                            lastUpdatedTime: lastUpdatedTime
                                        });
                                    }
                                });
                            }
                        }
                        else if (minutesDifference >= 80 && minutesDifference <= 85 && isCheckout === false) {
                            console.log("The time difference is between 60 and 65 minutes.");
                            const payload = {
                                token: fcmToken,
                                notification: {
                                    title: "EvloTime",
                                    body: `Hello ${firstName} ${lastName}, We miss you! 😢 It's been an hour since you waved goodbye to the app. How about a quick check-in?.`
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
                    }
                }
                else {
                    return;
                }
            }
            else{
                console.log("Current time is outside the specified range.");
            }

            });
        
        }
    });
});

// Scheduler for pushing the notification for remainding the employees to CheckOut(India)
exports.INDAppTerminateNotificationScheduler = functions.pubsub.schedule("*/5 * * * 1-5").timeZone("IST").onRun(async () => {
    console.log("successfully executed");

    const currentTym = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const currentTime = new Date(currentTym).getTime();

    const start = new Date(new Date(currentTime).getFullYear(), 0, 0);
    const diff = currentTime - Number(start);
    const oneDay = 1000 * 60 * 60 * 24;
    const todayDayOfYear = Math.floor(diff / oneDay);
    const currentYear = new Date(currentTime).getFullYear();
    console.log("Day of year: " + todayDayOfYear);
    console.log("year " + currentYear);

    const collections = firestore().collection("notifications");
    const snapshots = await collections.where("country", "==", "India").where("status", "==", true).get();
    if (snapshots.empty) {
        console.log("No matching documents in notification Collection.");
    }
    snapshots.forEach(async doc => {
        const newValue = doc.data();
        // const notifiCollectionId = doc.id;
        const lastUpdatedTime = newValue.lastUpdatedTime;
        const isCheckout = newValue.isCheckout;

        const updateDate = new Date(lastUpdatedTime);
        const currentDate = new Date(currentTime);

        // If updated timestamp is today then do the push notification after 15mins when the app is terminated
        if (currentDate.getDate() === updateDate.getDate() && currentDate.getMonth() === updateDate.getMonth() && currentDate.getFullYear() === updateDate.getFullYear()) {
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
                const checkin = document.data().checkInTime;
                const checkout = document.data().checkOutTime;
                console.log("checkInTime, CheckOutTime " + checkin +" "+checkout);
                const inTime = checkin.split(":");
                const outTime = checkout.split(":");
                const checkInTime = new Date();
                checkInTime.setHours(inTime[0], inTime[1], 0); // Set check-in time to 7:00 AM
                checkInTime.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" });
                const checkOutTime = new Date();
                checkOutTime.setHours(outTime[0], outTime[1], 0); // Set check-out time to 3:00 PM
                checkOutTime.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" });

                console.log("currentTime " + new Date(currentTime));
                console.log("checkInTime " + checkInTime);
                console.log("checkOutTime " + checkOutTime);

            if (currentTime >= checkInTime.getTime() && currentTime <= checkOutTime.getTime()) {
                console.log("Current time is within the specified range.");
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

                        const updateDate = new Date(lastUpdatedTime).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                        const updatedTime = new Date(updateDate).getTime();
                        // Checking whether the time difference is greater than 15mins and less than 20mins
                        const timeDifference = currentTime - updatedTime;
                        const minutesDifference = Math.abs(timeDifference / (1000 * 60));
                        console.log(`The time difference is ${minutesDifference} minutes.`);
                        if (minutesDifference >= 5 && minutesDifference <= 10 && isCheckout === false) {
                            console.log("The time difference is between 5 and 10 minutes.");
                            const payload = {
                                token: fcmToken,
                                notification: {
                                    title: "EvloTime",
                                    body: `Hello ${firstName} ${lastName}, Our system detected that you closed the Evlotime app. This is a friendly reminder to open your app to stay checkedin.`
                                },
                                data: {
                                    sound: "default"
                                }
                            };

                            admin.messaging().send(payload).then(async (response: any) => {
                                            // Response is a message ID string.
                            console.log(`Successfully sent message for ${employeeId}:`, response);
                            return { success: true };
                            }).catch((error: { code: any; }) => {
                            console.log(`something went wrong for ${employeeId}`, error);
                            });
                        }
                        else if (minutesDifference >= 20 && minutesDifference <= 25 && isCheckout === false) {
                            console.log("The time difference is between 20 and 25 minutes.");

                            const collections = firestore().collection("checkin");
                            const snapshots = await collections.where("employeeId", "==", employeeId).where("dayOfYear", "==", todayDayOfYear).where("year", "==", currentYear).get();
                            if (snapshots.empty) {
                                console.log("No matching documents in CheckIn Collection.");
                            }
                            else {
                                snapshots.forEach(async document => {
                                    const CheckInCollectionId = document.id;
                                    const checkOutTime = document.data().checkOutTime;
                                    const checkInTime = document.data().checkInTime;
                                    const checkInLocation = document.data().checkInLocation;
                                    console.log(new Date(checkInTime));
                                    console.log("checkInTime " + checkInTime);
                                    console.log("LastUpdatedTime " + lastUpdatedTime);

                                    if (checkOutTime == undefined) {
                                        const timeDifference = lastUpdatedTime - checkInTime;
                                        const minutesDifference = Math.floor(timeDifference / (1000 * 60));
                                        console.log("minutesDifference " + minutesDifference);
                                        const CheckInCollection = firestore().collection("checkin").doc(CheckInCollectionId);
                                        CheckInCollection.update({
                                            checkOutTime: lastUpdatedTime,
                                            checkOutLocation: checkInLocation,
                                            isCheckIn: false,
                                            workedTimeInMin: minutesDifference,
                                            lastUpdatedTime: lastUpdatedTime
                                        });
                                    }
                                });
                            }
                        }
                        else if (minutesDifference >= 80 && minutesDifference <= 85 && isCheckout === false) {
                            console.log("The time difference is between 60 and 65 minutes.");
                            const payload = {
                                token: fcmToken,
                                notification: {
                                    title: "EvloTime",
                                    body: `Hello ${firstName} ${lastName}, We miss you! 😢 It's been an hour since you waved goodbye to the app. How about a quick check-in?.`
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
                    }
                }
                else {
                    return;
                }
            }
            else{
                console.log("Current time is outside the specified range.");
            }

            });
            
        }
    });
});