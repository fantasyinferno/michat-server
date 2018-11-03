const axios = require('axios');

// let firebaseUserInfo = _.pick(body, ['disabled', 'displayName', 'email', 'emailVerified', 'password', 'phoneNumber', 'photoURL', 'uid']);
// let additionalUserInfo = _.pick(body, ['ngaySinh', 'role', 'name', 'gioiTinh']);
for (let i = 0; i < 20; ++i) {
    let username = `user${i}`;
    axios.post('https://o-michat.herokuapp.com/users', {
        disabled: false,
        displayName: username,
        email: username + '@gmail.com',
        emailVerified: false,
        password: username,
        photoURL: 'https://news.nationalgeographic.com/content/dam/news/2018/05/17/you-can-train-your-cat/02-cat-training-NationalGeographic_1484324.ngsversion.1526587209178.adapt.1900.1.jpg',
        ngaySinh: `${i}/01/1998`,
        role: 'friend',
        gioiTinh: (i % 2 == 0) ? 'nam' : 'nu',
    })
    .then(res => {
        console.log('Done with ', i);
    })
    .catch(e => {
        console.log(e);
    })
}