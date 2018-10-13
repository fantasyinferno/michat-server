/** Express router providing user-related routes
 * @module routers/users
 * @requires express
 * @requires async
 */
const async = require('async');
module.exports = (app, admin) => {
    const {verifyIdTokenMiddleware} = require('./middlewares')(app, admin);
    // get the firestore client
    let db = admin.firestore();
    db.settings({ timestampsInSnapshots: true });

    
    app.get('/rooms', verifyIdTokenMiddleware, (req, res) => {
        db.collection('users').where("uid", "==", req.decodedToken.uid)
        .get()
        .then((querySnapshots) => {
            if (querySnapshots.lenth == 1) {
                doc = querySnapshots[0].data();
                rooms = doc.inRooms;
                roomData = [];
                async.each(rooms, (room, callback) => {
                    db.collection('rooms').where('id', '==', roomId)
                    .get()
                    .then(querySnapshots => {
                        doc = querySnapshots[0].data();
                        roomData.append(doc);
                        callback();
                    })
                    .catch(err => {
                        callback(err);
                    });
                }, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).send();
                    }
                    console.log(roomData);
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
    });
};