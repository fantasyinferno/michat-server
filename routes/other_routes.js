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
    app.get('/', (req, res) => {
        res.render('homepage');
    });
    app.get('/docs', (req, res) => {
        res.sendFile('index.html', {
            root: './public/doc'
        });
    })
}