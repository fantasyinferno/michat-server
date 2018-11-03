/** Express router providing user-related routes
 * @module routers/users
 * @requires express
 * @requires axios
 * @requires async
 * @requires lodash
 * @requires multer
 */
const axios = require('axios');
const _ = require('lodash');
const async = require('async');
const multer = require('multer');
const uuidv1 = require('uuid/v1');
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});
module.exports = (app, admin) => {
    const {verifyIdTokenMiddleware} = require('./middlewares')(app, admin);    
    let db = admin.firestore();
    let bucket = admin.storage().bucket();
    /** 
     * @api {post} /files Uploading files to the server
     * @apiName PostFile
     * @apiGroup File
     * 
     * @apiDescription This API endpoint allows users to upload files, by appending a file with the key "attachment"
     * into their FormData and sent it to the server.
     * @apiSuccess {String} fileUrl The url of the uploaded file
     */
    app.post('/files', upload.single('attachment'), (req, res) => {

        bucket.upload(req.file.path, {
            destination: `${uuidv1()}`, // generate a unique file name
            gzip: true,
        })
        .then(uploadResponse => {
            file = uploadResponse[0];
            return file.getSignedUrl({
                action: 'read',
                expires: '01-01-2491',
            })
        })
        .then(signedUrls => {
            res.send({fileUrl: signedUrls[0]});
        })
        .catch(e => {
            console.log(e);
            res.status(400).send();
        });
    });
};