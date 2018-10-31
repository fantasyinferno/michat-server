/** Express router providing user-related routes
 * @module routers/users
 * @requires express
 * @requires axios
 * @requires async
 * @requires lodash
 */
const axios = require('axios');
const _ = require('lodash');
const async = require('async');
module.exports = (app, admin) => {
    const {verifyIdTokenMiddleware} = require('./middlewares')(app, admin);    
    let db = admin.firestore();
    /** Route serving user's personal information
     * @name GET /users/me
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner   
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.get('/users/me', verifyIdTokenMiddleware, (req, res) => {
        let decodedToken = req.decodedToken;
        admin.auth().getUser(decodedToken.uid)
        .then(function(userRecord) {
            userRecord.name = "";
            userRecord.avatar = "";
            userRecord.role = "";
            userRecord.gioiTinh = "";
            userRecord.ngaySinh = "";
            return res.json(userRecord.toJSON());
        })
        .catch(function(error) {
            console.log("Error fetching user data:", error);
            res.status(400).send();
        });
    });
    /** Route for creating user
     * @name POST /users
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.post('/users', (req, res) => {
        let body = req.body;
        let firebaseUserInfo = _.pick(body, ['disabled', 'displayName', 'email', 'emailVerified', 'password', 'phoneNumber', 'photoURL', 'uid']);
        let additionalUserInfo = _.pick(body, ['ngaySinh', 'role', 'name', 'gioiTinh']);
        admin.auth().createUser(firebaseUserInfo)
            .then(function(userRecord) {
                db.collection('users').doc(userRecord.uid)
                .set(additionalUserInfo,{merge: true});
                res.send(userRecord);
            })
            .catch(function(error) {
              console.log("Error creating new user:", error);
              res.status(400).send();
            });
    });
    /** Route for updating user's information
     * @name PATCH /users/:uid
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.patch('/users/:uid', (req, res) => {
        let uid = req.params.uid;
        let body = req.body;
        let firebaseUserInfo = _.pick(body, ['disabled', 'displayName', 'email', 'emailVerified', 'password', 'phoneNumber', 'photoURL', 'uid']);
        let additionalUserInfo = _.pick(body, ['ngaySinh', 'role', 'name', 'gioiTinh']);
        admin.auth().updateUser(uid, firebaseUserInfo)
            .then(function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              db.collection('users').doc(userRecord.uid)
              .set(additionalUserInfo,{merge: true});
              res.send(userRecord);
            })
            .catch(function(error) {
              console.log("Error updating user:", error);
              res.status(400).send();
            });
    });
    /** Route for deleting a user
     * @name DELETE /users/:uid
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.delete('/users/:uid', (req, res) => {
        let uid = req.params.uid;
        admin.auth().deleteUser(uid)
        .then(function() {
            console.log("Successfully deleted user");
            return res.send();
        })
        .catch(function(error) {
            console.log("Error deleting user:", error);
        });
    });
    
    /** Route for getting online users
     * @name GET /users/online
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.get('/users/online', verifyIdTokenMiddleware, (req, res) => {
        db.collection('onlineUsers').where('isOnline', '==', true)
        .get()
        .then(snapshot => {
            let userData = []; 
            async.each(snapshot.docs, function(doc, callback) {
                let uid = doc.id;
                db.collection('users').doc(uid).get().then(userDoc => {
                    userData.push(userDoc.data());
                    callback();
                });
            }, function(err) {
                if (err) {
                    throw err;  
                }
                return res.send(userData);
            });
        })
        .catch(e => {
            console.log(e);
            res.status(400).send();
        });
    });

    /** Route for registering user's ip and port upon signing in
     * @name POST /users/signin
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.post('/users/signin', (req, res) => {
        let email = req.body.email;
        let password = req.body.password;
        const APIKey = 'AIzaSyDu7vjq9CAKjeGSUQJi2ZxoVzgXcsyZ0qs';
        let signInUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${APIKey}`;
        axios.post(signInUrl, {
            email, password,
            returnSecureToken: true,
        })
        .then(response => {   
            // let uid = response.data.localId;
            // let localIp = req.body.localIp;
            // networkInformation = {
            //     publicIp: req.get('x-forwarded-for') || req.connection.remoteAddress,
            //     localIp: req.body.localIp || null,
            //     port: req.get('x-forwarded-port') || req.connection.remotePort,
            // }
            // db.collection('users').doc(uid).set(networkInformation, { merge: true });
            // db.collection('onlineUsers').doc(uid).set({isOnline: true}, {merge: true});
            res.send({
                idToken: response.data.idToken,
                refreshToken: response.data.refreshToken,
                // networkInformation
            }); 
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send();
        });
    });
    /** Route for registering user's ip and port upon signing in
     * @name POST /users/signout
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.post('/users/signout', verifyIdTokenMiddleware, (req, res) => {
        // Revoke all refresh tokens for a specified user for whatever reason.
        // Retrieve the timestamp of the revocation, in seconds since the epoch.
        let uid = req.decodedToken.uid;
        admin.auth().revokeRefreshTokens(uid)
        .then(() => {
            return admin.auth().getUser(uid);
        })
        .then((userRecord) => {
            return new Date(userRecord.tokensValidAfterTime).getTime() / 1000;
        })
        .then((timestamp) => {
            res.send({timestamp});
        })
        .catch(e => {
            console.log(e);
            res.status(400).send();
        });
    });
    /** Route serving user's ip and port
     * @name GET /users/ip/:email
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.get('/users/ip', (req, res) => {
        let email = req.query.email;
        admin.auth().getUserByEmail(email)
        .then((userRecord) => {
            let uid = userRecord.uid;
            return db.collection('users').doc(uid).get();
        })
        .then((doc) => {
            let data = doc.data();
            res.send({
                publicIp: data.publicIp,
                localIp: data.localIp,
                port: data.port,
            });
        })
        .catch(e => {
            console.log(e);
            res.status(400).send();
        });
    });

    app.get('/users/signup', (req, res) => {
        res.render('signup');
    });
    /*
    1. Determine the messaging process
The user opens the app. The user sees a sign in screen.
The user signs in and see a welcome message.
The user sees her list of rooms.
The user accesses one of the rooms.
The user composes her message.
The user presses "Send".
The user closes the chat box.
The user opens another chat box.
The user composes her message.
The user closes that chat box.
The user proceeds to add a new friend.
The user enters the a person's name to the search bar.
The user sees the results appear as she types.
The user click on one of the friend.
The user sees his profile.
The user presses the "add friend" button.
The user closes the search bar.
The user sees a new chat box appears.
The user clicks on the chat box's setting.
The user click "Block"
The user proceeds to confirm the blocking.
The user sees the new chat box disappears.
The user logs out.
2. List the routers that are needed
POST /users/signin
GET /rooms/my
GET /rooms/:id
POST /rooms/:id
GET /users?searchString=[searchString]
GET /users/:id
POST /users/friends
POST /users/blocks
POST /users/signout
3. Implement the routers
    */
};