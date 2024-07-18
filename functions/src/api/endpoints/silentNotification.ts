import express = require("express");
import * as functions from "firebase-functions";
const admin = require("firebase-admin");
// import * as path from 'path';

const app = express();
app.set("view engine", "ejs");
//app.set('views', path.join(__dirname, './views'));
app.use(express.static("views/assets"));

app.get("/sendSilentNotification", function (req, res) {
    const { registrationToken } = req.body;
    if (!registrationToken) {
        res.status(400).json({
            success: false,
            error: "Invalid request. Either topic or registrationToken is required.",
        });
        return;
    }
    const message = {
        token: registrationToken,
        data: {
            silent: "true",
        },
    };
    // Send the silent notification using FCM
    admin
        .messaging()
        .send(message)
        .then(() => {
            res.status(200).json({
                success: true,
                message: "Silent notification sent successfully",
            });
        })
        .catch((error: any) => {
            console.error("Error sending silent notification:", error);
            res
                .status(500)
                .json({ success: false, error: "Failed to send silent notification" });
        });
});

export const sendSilentNotification = functions.https.onRequest(app);
