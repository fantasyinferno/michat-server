module.exports = (app, admin) => {
    return {
        verifyIdTokenMiddleware: (req, res, next) => {
            idToken = req.get('Access-Token');
            admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
                req.decodedToken = decodedToken;
                next();
            }).catch(function(error) {
                // authentication error
                console.log(error);
                res.status(400).send();
            });
        }   
    }
}
