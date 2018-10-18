const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const {app, admin} = require('../server');
const apiKey = 'AIzaSyDu7vjq9CAKjeGSUQJi2ZxoVzgXcsyZ0qs';
const signInUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${apiKey}`;

describe('Test authentication', function() {
  describe('Test creating new user', () => {
    it('should create a new user', (done) => {
      chai.request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({
        email: "createdemail03@invalidemail.com",
        emailVerified: false,
        phoneNumber: "+11234567890",
        password: "createdpassword03",
        displayName: "John Doe",
        photoURL: "http://www.example.com/12345678/photo.png",
        disabled: false
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        res.body.email.should.equal("createdemail03@invalidemail.com")
        done();
      })
      .catch(err => {
        done(err);
      }); 
    }).timeout(6000);
  })
  describe('Test getting user data', () => {
    it('should respond with user data', (done) => {
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
        .get('/users/me')
        .set('Access-Token', idToken);
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        res.body.email.should.equal("createdemail01@invalidemail.com");
        done();
      })
      .catch(err => {
        done(err);
      }); 
    }).timeout(6000);
  })
  describe('Test ip and port processing', () => {
    it('should report the port and the ip', (done) => {
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
        .post('/users/ip')
        .set('Access-Token', idToken);
      })
      .then((res) => {
        res.status.should.equal(200);
        done();
      })
      .catch(err => {
        done(err);
      });
    }).timeout(10000);
  })
  // describe('Test users and their rooms', function() {
  //   it('should log in and retrieve all the rooms back', function(done) {
  //     chai.request(signInUrl)
  //     .post('')
  //     .set('Content-Type', 'application/json')
  //     .send({
  //       "email": "createdemail01@invalidemail.com",
  //       "password": "createdpassword01",
  //       "returnSecureToken": true
  //     })
  //     .then((res) => {
  //       res.status.should.equal(200);
  //       should.exist(res.body);
  //       let idToken = res.body.idToken;
  //       idToken.should.be.a('string');
  //       return chai.request(app)
  //       .get('/rooms')
  //       .set('Access-Token', idToken);
  //     })
  //     .then((res) => {
  //       res.status.should.equal(200);
  //       done();
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       done(err);
  //     })
  //   }).timeout(4000);
  // });
});