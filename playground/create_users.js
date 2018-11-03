const axios = require('axios');

// let firebaseUserInfo = _.pick(body, ['disabled', 'displayName', 'email', 'emailVerified', 'password', 'phoneNumber', 'photoURL', 'uid']);
// let additionalUserInfo = _.pick(body, ['ngaySinh', 'role', 'name', 'gioiTinh']);
for (let i = 0; i < 20; ++i) {
    let username = `user${i}`;
    axios.delete('https://o-michat.herokuapp.com/users', {
        params: {
            name: username,
        }
    })
    .then(res => {
        console.log('Deleted user no #', i);
    })
    .catch(e => {
        console.log(e);
    })
}