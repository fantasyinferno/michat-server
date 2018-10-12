const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const {app, admin} = require('../server');
const apiKey = 'AIzaSyDu7vjq9CAKjeGSUQJi2ZxoVzgXcsyZ0qs';
const signInUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${apiKey}`;

describe('Test authentication', function() {
  describe('Test getting the ip and the port', () => {
    it('should receive the uid, local ip and port', (done) => {
      chai.request(signInUrl)
      .post('')
      .set('Content-Type', 'application/json')
      .send({
        "email": "createdemail01@invalidemail.com",
        "password": "createdpassword01",
        "returnSecureToken": true
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        let idToken = res.body.idToken;
        idToken.should.be.a('string');
        return chai.request(app)
        .get('/users/ip')
        .set('Access-Token', idToken);
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        res.body.uid.should.be.a('string');
        res.body.ip.should.be.a('string');
        res.body.port.should.be.a('int');
        done();
      })
      .catch(err => {
        done(err);
      });
    })
  })
  describe('Test users and their rooms', function() {
    it('should log in and retrieve all the rooms back', function(done) {
      chai.request(signInUrl)
      .post('')
      .set('Content-Type', 'application/json')
      .send({
        "email": "createdemail01@invalidemail.com",
        "password": "createdpassword01",
        "returnSecureToken": true
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        let idToken = res.body.idToken;
        idToken.should.be.a('string');
        return chai.request(app)
        .get('/rooms')
        .set('Access-Token', idToken);
      })
      .then((res) => {
        res.status.should.equal(200);
        done();
      })
      .catch(err => {
        console.log(err);
        done(err);
      })
    });
  });
});