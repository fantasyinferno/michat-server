module.exports = (app, admin) => {
    const {verifyIdTokenMiddleware} = require('./middlewares')(app, admin);    
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
    app.get('/users/ip', verifyIdTokenMiddleware, (req, res) => {
        let uid = req.decodedToken.uid;
        let ip = req.socket.address().address;
        let port = req.socket.address().port;
        res.send({
            uid, ip, port
        });
    });
};