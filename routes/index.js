const userRoutes = require('./user_routes');
const roomRoutes = require('./room_routes');
const fileRoutes = require('./file_routes');
/*
API specifications
- GET /users: retrieve a user (require authentication proof)
- POST /users: create a user
- UPDATE /users: update a user
- DELETE /users: delete a user
*/

module.exports = (app, admin) => {
    userRoutes(app, admin);
    roomRoutes(app, admin);
    fileRoutes(app, admin);
}