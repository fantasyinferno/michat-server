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
    /**
     * @api {get} /users/me Request Signed-In User information
     * @apiName GetMyUser
     * @apiGroup User
     *
     *
     * @apiSuccess {Object} customClaims 
     * @apiSuccess {Boolean} disabled 
     * @apiSuccess {String} displayName
     * @apiSuccess {String} email
     * @apiSuccess {Boolean} emailVerified 
     * @apiSuccess {Object} metadata
     * @apiSuccess {String} passwordHash
     * @apiSuccess {String} passwordSalt
     * @apiSuccess {String} phoneNumber
     * @apiSuccess {String} photoURL
     * @apiSuccess {String} providerData
     * @apiSuccess {Array} tokensValidAfterTime
     * @apiSuccess {String} uid
     * @apiSuccess {String} name
     * @apiSuccess {String} ngaySinh
     * @apiSuccess {String} gioiTinh
     * @apiSuccess {String} role
     * 
     * 
     */
    app.get('/users/me', verifyIdTokenMiddleware, (req, res) => {
        let decodedToken = req.decodedToken;
        admin.auth().getUser(decodedToken.uid)
        .then(function(userRecord) {
            db.collection('users').doc(decodedToken.uid)
            .get()
            .then(function(doc) {
                data = doc.data();
                merged = {...userRecord, ...data}
                return res.send(merged);  
            })
        })
        .catch(function(error) {
            console.log("Error fetching user data:", error);
            res.status(400).send();
        });
    });
    /**
     * @api {get} /users/all List all users
     * @apiName GetAllUsers
     * @apiGroup User
     *
     *
     * @apiSuccess {Object} customClaims 
     * @apiSuccess {Boolean} disabled 
     * @apiSuccess {String} displayName
     * @apiSuccess {String} email
     * @apiSuccess {Boolean} emailVerified 
     * @apiSuccess {Object} metadata
     * @apiSuccess {String} passwordHash
     * @apiSuccess {String} passwordSalt
     * @apiSuccess {String} phoneNumber
     * @apiSuccess {String} photoURL
     * @apiSuccess {String} providerData
     * @apiSuccess {Array} tokensValidAfterTime
     * @apiSuccess {String} uid
     * @apiSuccess {String} name
     * @apiSuccess {String} ngaySinh
     * @apiSuccess {String} gioiTinh
     * @apiSuccess {String} role
     */
    app.get('/users/all', (req, res) => {
        userRecords = [];
        function doneListingAllUsers() {
            userReferences = userRecords.map(val => db.doc('users/' + val.uid));
            db.getAll(userReferences).then(docs => {
                userData = [];
                docs.forEach((doc, index) => {
                    userData.push({...userRecords[index], ...doc.data()});
                });
                res.send(userData);
            })  
            .catch(e => {
                console.log(e);
                res.status(400).send();
            });         
        }
        function listAllUsers(nextPageToken) {
            // List batch of users, 1000 at a time.
            admin.auth().listUsers(1000, nextPageToken)
              .then(function(listUsersResult) {
                listUsersResult.users.forEach(function(userRecord) {
                    userRecords.push(userRecord);
                });
                if (listUsersResult.pageToken) {
                  // List next batch of users.
                  return listAllUsers(listUsersResult.pageToken)
                }
                doneListingAllUsers();
              })
              .catch(function(error) {
                console.log("Error listing users:", error);
                return res.status(400).send();
              });
          }
          // Start listing users from the beginning, 1000 at a time.
        listAllUsers()

    });
    /**
     * @api {get} /users Request User information
     * @apiName GetUser
     * @apiGroup User
     *
     * @apiParam {String} name Users name.
     *
     * @apiSuccess {Object} customClaims 
     * @apiSuccess {Boolean} disabled 
     * @apiSuccess {String} displayName
     * @apiSuccess {String} email
     * @apiSuccess {Boolean} emailVerified 
     * @apiSuccess {Object} metadata
     * @apiSuccess {String} passwordHash
     * @apiSuccess {String} passwordSalt
     * @apiSuccess {String} phoneNumber
     * @apiSuccess {String} photoURL
     * @apiSuccess {String} providerData
     * @apiSuccess {Array} tokensValidAfterTime
     * @apiSuccess {String} uid
     * @apiSuccess {String} name
     * @apiSuccess {String} ngaySinh
     * @apiSuccess {String} gioiTinh
     * @apiSuccess {String} role
     */
    app.get('/users', verifyIdTokenMiddleware, (req, res) => {
        let name = req.query.name;
        let decodedToken = req.decodedToken;
        let data = {};
        db
        .collection('users')
        .where("name", "==", name)
        .get()
        .then(function(query) {
            data = query.docs[0].data();
            return admin.auth().getUser(query.docs[0].id)
        })
        .then(function(userRecord) {
            merged = {...userRecord, ...data}; 
            res.send(merged);
        })
        .catch(function(error) {
            console.log("Error fetching user data:", error);
            res.status(400).send();
        });
    });
    /**
     * @api {post} /users Create A User
     * @apiName PostUser
     * @apiGroup User
     *
     * @apiParam {Boolean} disabled If the user is disabled.
     * @apiParam {String}  displayName The displayName of the user
     * @apiParam {String}  email The user's email
     * @apiParam {String}  emailVerified Whether the user's email is verified
     * @apiParam {String}  password The user's password in plaintext
     * @apiParam {String}  phoneNumber A valid phone number
     * @apiParam {String}  photoURL The photo which will be taken as avatar
     * @apiParam {String}  uid The id of the user. This will be generated if left unspecified
     * @apiParam {String}  ngaySinh The user's birthdate
     * @apiParam {String}  role The role of the user
     * @apiParam {String}  name The username 
     * @apiParam {String}  gioiTinh The user's gender
     * 
     * @apiSuccess {Object} customClaims The claims the user have on the database
     * @apiSuccess {Boolean} disabled Whether the user is disabled
     * @apiSuccess {String} displayName The displayname of the user
     * @apiSuccess {String} email The user's email
     * @apiSuccess {Boolean} emailVerified Whether the user's email is verified
     * @apiSuccess {Object} metadata 
     * @apiSuccess {String} passwordHash 
     * @apiSuccess {String} passwordSalt 
     * @apiSuccess {String} phoneNumber
     * @apiSuccess {String} photoURL
     * @apiSuccess {String} providerData
     * @apiSuccess {Array} tokensValidAfterTime
     * @apiSuccess {String} uid
     * @apiSuccess {String} name
     * @apiSuccess {String} ngaySinh
     * @apiSuccess {String} gioiTinh
     * @apiSuccess {String} role
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
    app.delete('/users/:uid', (req, res) => {
        let uid = req.params.uid;
        admin.auth().deleteUser(uid)
        .then(function() {
            return res.send();
        })
        .catch(function(error) {
            console.log("Error deleting user:", error);
        });
    });
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
    /**
     * @api {post} /users/signin Sign In A User
     * @apiName SignInUser
     * @apiGroup User
     *
     * @apiParam {String} email User's email
     * @apiParam {String} password User's password in plaintext
     * 
     * @apiSuccess {String} idToken The token of the user for signing in
     * @apiSuccess {String} refreshToken The refresh token of the user
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
    /**
     * @api {post} /users/signout Sign Out  A User
     * @apiName SignOutUser
     * @apiGroup User
     *
     * @apiSuccess {String} timestamp The time at which the user's token is valid now
     */
    app.post('/users/signout', verifyIdTokenMiddleware, (req, res) => {
        // Revoke all refresh tokens for a specified user for whatever reason.
        // Retrieve the timestamp of the revocation, in seconds since the epoch.
        let uid = req.decodedToken.uid;
        admin.auth().revokeRefreshTokens(uid)
        .then(() => {
            db.collection('onlineUsers').doc(uid).set({
                isOnline: false,
            });
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
};