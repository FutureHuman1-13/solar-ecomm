const admin = require("firebase-admin");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, //max size 1 mb
});

var serviceAccount = require("../config/solar-image.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL:
  //   "https://react-native-maps-74b50-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "solar-app.appspot.com",
});

const bucket = admin.storage().bucket();

function uploadImagesToFirebase(req, res, next) {
  const files = req.files;
  if (!files || files.length === 0) {
    return next();
  }
  const uploadedFiles = [];
  // Iterate through all the files provided and upload them to Firebase Storage

  Promise.all(
    files.map((file) => {
      const fileName = file.originalname;
      const fileUpload = bucket.file(fileName);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
      blobStream.on("error", (error) => {
        console.log(error);
        next(error);
      });
      blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        //const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media`;
        uploadedFiles.push({
          fieldname: file.fieldname,
          name: fileName,
          url,
        });
        if (uploadedFiles.length === files.length) {
          req.uploadedFiles = uploadedFiles;
          next();
        }
      });
      blobStream.end(file.buffer);
    })
  ).catch((error) => next(error));
}
function uploadImagesToFirebaseUpdate(req, res, next) {
  // console.log(req.files);
  const files = req.files;
  if (!files || files.length === 0) {
    return next();
  }
  const uploadedFiles = [];
  // Iterate through all the files provided and upload them to Firebase Storage
  Promise.all(
    files.map((file) => {
      const fileName = file.originalname;
      const fileUpload = bucket.file(fileName);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
      blobStream.on("error", (error) => {
        console.log(error);
        next(error);
      });
      blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        //const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media`;
        uploadedFiles.push({
          fieldname: file.fieldname,
          name: fileName,
          url,
        });
        if (uploadedFiles.length === files.length) {
          req.uploadedFiles = uploadedFiles;
          next();
        }
      });
      blobStream.end(file.buffer);
    })
  ).catch((error) => next(error));
}
module.exports = {
  upload,
  uploadImagesToFirebase,
  uploadImagesToFirebaseUpdate,
};
