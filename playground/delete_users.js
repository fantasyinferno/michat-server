

const axios = require('axios');
const admin = require('../config');
// let firebaseUserInfo = _.pick(body, ['disabled', 'displayName', 'email', 'emailVerified', 'password', 'phoneNumber', 'photoURL', 'uid']);
// let additionalUserInfo = _.pick(body, ['ngaySinh', 'role', 'name', 'gioiTinh']);
for (let i = 0; i < 20; ++i) {
    let username = `user${i}`;
    admin.auth().getUserByEmail(username + '@gmail.com')
    .then((userRecord) => {
        return admin.auth().deleteUser(userRecord.uid)
    })
    .then(() => {
        console.log('Deleted ' + i);
    })
    .catch(e => {
        console.log(e);
    });
}