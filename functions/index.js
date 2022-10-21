const fs = require("fs");
const util = require("util");
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const FormData = require("form-data");

const fetch = require("node-fetch");
const formidable = require("formidable-serverless");

exports.uploadAudio = functions
  .runWith({
    timeoutSeconds: 180,
    secrets: ["UPLOAD_SECRET", "PRIVATE_SERVER"],
  })
  .https.onRequest(async (req, res) => {
    const form = new formidable.IncomingForm();
    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        // console.log(JSON.stringify({ fields, files }, null, 2));

        const file = files.file;
        if (!file) {
          reject(new Error("no file to upload, please choose a file."));
          return;
        }

        const filePath = file.path;
        // const fileType = file.type;
        // console.log("File path: " + filePath);
        // console.log("File path: " + fileType);
        // console.log(util.inspect(file));

        const form = new FormData();
        form.append("token", process.env.UPLOAD_SECRET);
        form.append("file", fs.createReadStream(filePath));

        const dataRemote = await fetch(process.env.PRIVATE_SERVER + "/upload", {
          method: "POST",
          body: form,
        });

        const dataRemoteDecoded = await dataRemote.text();
        const dataConverted = JSON.parse(dataRemoteDecoded);

        resolve(dataConverted);
      });
    })
      .then((response) => {
        res.status(200).json(response);
        return null;
      })
      .catch((err) => {
        console.error("Error while parsing form: " + err);
        res.status(500).json({ error: err });
      });
  });
