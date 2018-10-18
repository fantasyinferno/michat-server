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
        let userInfo = req.body;
        console.log(req.body);
        admin.auth().createUser(userInfo)
            .then(function(userRecord) {
                return res.json(userRecord);
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
        let localIp = req.body.localIp;
        ipPortObject = {
            publicIp: req.get('x-forwarded-for') || req.connection.remoteAddress,
            localIp: req.body.localIp || null,
            port: req.get('x-forwarded-port') || req.connection.remotePort,
        }
        let setRef = db.collection('users').doc(req.decodedToken.uid).set(ipPortObject, { merge: true });
        res.send(ipPortObject);
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
    app.get('/users', verifyIdTokenMiddleware, (req,res) => {
        searchString = req.query.searchString;

    });
};