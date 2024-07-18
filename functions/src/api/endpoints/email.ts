import express = require("express");
import * as functions from "firebase-functions";
import { Log } from "../config";
// import * as path from 'path';

const app = express();
app.set("view engine", "ejs");
//app.set('views', path.join(__dirname, './views'));
app.use(express.static("views/assets"));

app.get("/verify", function (req, res) {
  const mode = req.query.mode;
  // Get the one-time code from the query parameter.
  const actionCode = req.query.oobCode;
  // (Optional) Get the continue URL from the query parameter if available.
  const continueUrl = req.query.continueUrl;
  // (Optional) Get the language code if available.
  const lang = req.query.lang || "en";

  const apiKey = req.query.apiKey;

  const role = req.query.role;

  const params = {
    mode: mode,
    actionCode: actionCode,
    continueUrl: continueUrl,
    lang: lang,
    key: apiKey,
    env: process.env.GCLOUD_PROJECT,
    role: role,
  };

  Log.info(params);

  res.render("index", {
    params: params,
  });
});

export const email = functions.https.onRequest(app);
