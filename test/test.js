const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const {app, admin} = require('../server');
const apiKey = 'AIzaSyDu7vjq9CAKjeGSUQJi2ZxoVzgXcsyZ0qs';
const signInUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${apiKey}`;
const fs = require('fs');

describe('Test authentication', function() {
  describe('Test signing in to the server', () => {
    it('should sign in to the server', (done) => {
      chai.request(app)
      .post('/users/signin')
      .set('Content-Type', 'application/json')
      .send({
        email: 'napoleon@france.com',
        password: 'napoleon',
      })
      .then(res => {
        res.status.should.equal(200);
        should.exist(res.body);
        done();
      })
      .catch(e => {
        done(e);
      });
    }).timeout(20000);
    it('should sign in a user and then sign out', (done) => {
      chai.request(app)
      .post('/users/signin')
      .set('Content-Type', 'application/json')
      .send({
        email: 'napoleon@france.com',
        password: 'napoleon',
      })
      .then(res => {
        res.status.should.equal(200);
        should.exist(res.body);
        return chai.request(app)
        .post('/users/signout')
        .set('Access-Token', res.body.idToken)
        .send();
      })
      .then(res => {
        res.status.should.equal(200);
        should.exist(res.body);
        should.exist(res.body.timestamp);
        res.body.timestamp.should.be.a('number');
        done();
      })
      .catch(e => {
        done(e);
      });
    }).timeout(10000);
  });
  // describe('Test creating new user', () => {
  //   it('should create a new user', (done) => {
  //     chai.request(app)
  //     .post('/users')
  //     .set('Content-Type', 'application/json')
  //     .send({
  //       email: "createdemail03@invalidemail.com",
  //       emailVerified: false,
  //       phoneNumber: "+11234567890",
  //       password: "createdpassword03",
  //       displayName: "John Doe",
  //       photoURL: "http://www.example.com/12345678/photo.png",
  //       disabled: false
  //     })
  //     .then((res) => {
  //       res.status.should.equal(200);
  //       should.exist(res.body);
  //       res.body.email.should.equal("createdemail03@invalidemail.com")
  //       done();
  //     })
  //     .catch(err => {
  //       done(err);
  //     }); 
  //   }).timeout(6000);
  // })
  describe('Test getting user data', () => {
    it('should respond with user data', (done) => {
      chai.request(signInUrl)
      .post('')
      .set('Content-Type', 'application/json')
      .send({
        "email": "tuankiet@gmail.com",
        "password": "tuankiet",
        "returnSecureToken": true
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        let idToken = res.body.idToken;
        idToken.should.be.a('string');
        return chai.request(app)
        .get('/users/me')
        .set('Access-Token', idToken)
        .send();
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        res.body.name.should.be.a('string');
        res.body.email.should.equal("tuankiet@gmail.com");
        res.body.displayName.should.equal("Lương Tuấn Kiệt");
        res.body.name.should.equal("tuankiet");
        done();
      })
      .catch(err => {
        done(err);
      }); 
    }).timeout(6000);
    it('should respond with another user data', (done) => {
      chai.request(signInUrl)
      .post('')
      .set('Content-Type', 'application/json')
      .send({
        "email": "tuankiet@gmail.com",
        "password": "tuankiet",
        "returnSecureToken": true
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        let idToken = res.body.idToken;
        idToken.should.be.a('string');
        return chai.request(app)
        .get('/users')
        .set('Access-Token', idToken)
        .query({
          name: 'quanghuy'
        })
        .send();
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        res.body.name.should.be.a('string');
        res.body.email.should.equal("quanghuy@gmail.com");
        res.body.displayName.should.equal("Nguyễn Khắc Quang Huy");
        res.body.name.should.equal("quanghuy");
        done();
      })
      .catch(err => {
        done(err);
      }); 
    }).timeout(15000);
    it('should return the list of user who is online', (done) => {
        chai.request(signInUrl)
        .post('')
        .set('Content-Type', 'application/json')
        .send({
          "email": "napoleon@france.com",
          "password": "napoleon",
          "returnSecureToken": true
        })
        .then((res) => {
          res.status.should.equal(200);
          should.exist(res.body);
          let idToken = res.body.idToken;
          idToken.should.be.a('string');
          return chai.request(app)
          .get('/users/online')
          .set('Access-Token', idToken);
        })
        .then((res) => {
          res.status.should.equal(200);
          res.body.should.be.a('array');
          done();
        })
        .catch(err => {
          done(err);
        });
      }).timeout(10000);
    });
  describe('Test ip and port processing', () => {
    it('should report the port and the ip', (done) => {
      chai.request(signInUrl)
      .post('')
      .set('Content-Type', 'application/json')
      .send({
        "email": "napoleon@france.com",
        "password": "napoleon",
        "returnSecureToken": true
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        let idToken = res.body.idToken;
        idToken.should.be.a('string');
        return chai.request(app)
        .get('/users/ip?email=napoleon@france.com')
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
  describe('Sending file to the server', () => {
    it('should upload a file to the server and get a link back', (done) => {
      chai.request(signInUrl)
      .post('')
      .set('Content-Type', 'application/json')
      .send({
        "email": "napoleon@france.com",
        "password": "napoleon",
        "returnSecureToken": true
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        let idToken = res.body.idToken;
        idToken.should.be.a('string');
        return chai.request(app)
        .post('/files')
        .set('Access-Token', idToken)
        .attach('attachment', fs.readFileSync('./test/avatar.png'), 'avatar.png');
      })
      .then((res) => {
        res.status.should.equal(200);
        should.exist(res.body);
        res.body.fileUrl.should.be.a('string');
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