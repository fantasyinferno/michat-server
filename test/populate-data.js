// const admin = require('../config');

// let db = admin.firestore();
// db.settings({
//     timestampsInSnapshots: true
// });
// let roomA = {
//     id: 'roomA',
//     name: 'Room A',
//     user: [1,2],
//     messages: [{
//         sender: '1',
//         content: 'Hello. Are you a human?',
//         sendAt: '2018-10-10T01-02-03'
//     }, {
//         sender: '2',
//         content: 'Yes.',
//         sendAt: '2018-10-10T02-02-04'
//     }, {
//         sender: '1',
//         content: 'Okay, good to know.',
//         sendAt: '2018-10-10T03-02-05'
//     }]
// };

// let roomB = {
//     id: 'roomB',
//     name: 'Room B',
//     user: [2],
//     messages: [{
//         sender: '2',
//         content: 'Anyone else in this room?',
//         sendAt: '2018-10-10T01-01-01',
//     }, {
//         sender: '2',
//         content: 'Oh. Just me. :-o',
//         sendAt: '2018-10-10T01-01-02',
//     }]
// };

// let userA = {
//     uid: '1',
//     inRooms: [
//         'roomA',
//     ]
// };

// let userB = {
//     uid: '2',
//     inRooms: [
//         'roomA',
//         'roomB'
//     ]
// };

// db.collection("rooms").add(roomA)
// .then(function(docRef) {
//     console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//     console.error("Error adding document: ", error);
// });
// db.collection("rooms").add(roomB)
// .then(function(docRef) {
//     console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//     console.error("Error adding document: ", error);
// });
// db.collection("users").add(userA)
// .then(function(docRef) {
//     console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//     console.error("Error adding document: ", error);
// });
// db.collection("users").add(userB)
// .then(function(docRef) {
//     console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//     console.error("Error adding document: ", error);
// });