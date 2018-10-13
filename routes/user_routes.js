/** Express router providing user-related routes
 * @module routers/users
 * @requires express
 */
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
            return res.json(userRecord.toJSON());
        })
        .catch(function(error) {
            console.log("Error fetching user data:", error);
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
        let userInfo = req.body;
        admin.auth().createUser(userInfo)
            .then(function(userRecord) {
              return res.send();
            })
            .catch(function(error) {
              console.log("Error creating new user:", error);
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
        let userInfo = req.body;
        admin.auth().updateUser(uid, userInfo)
            .then(function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              console.log("Successfully updated user", userRecord.toJSON());
            })
            .catch(function(error) {
              console.log("Error updating user:", error);
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
    /** Route for registering user's ip and port
     * @name POST /users/ip
     * @author fantasyinferno@gmail.com
     * @function
     * @memberof module: routers/users~usersRouter
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     */
    app.post('/users/ip', verifyIdTokenMiddleware, (req, res) => {
        let uid = req.decodedToken.uid;
        let setRef = db.collection('users').doc(req.decodedToken.uid).set({
            ip: req.connection.remoteAddress,
            port: req.connection.remotePort,
        }, { merge: true });
        res.send();
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
    app.get('/users/ip/:email', (req, res) => {
        let email = req.params.email;
        admin.auth().getUserByEmail(email)
        .then((userRecord) => {
            let uid = userRecord.uid;
            return db.collection('users').doc(uid).get();
        })
        .then((doc) => {
            let data = doc.data();
            res.send({
                ip: data.ip,
                port: data.port,
            });
        })
        .catch(e => {
            console.log(e);
            res.status(400).send();
        });
    });
};