// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
    it('Positive: successful register', done => {
    const username = '1';
    const password = '1';
    chai
      .request(server)
      .post('/register')
      .send({ username, password })
      .redirects(0)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        expect(res).to.have.status(302);
        expect(res).to.redirectTo('/'); 

        done();
      });
  });

  it('negative: unsuccessful register', done => {
    const username = '1';
    const password = '1';
    chai
      .request(server)
      .post('/register')
      .send({ username, password })
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).to.include('Username is already taken');
        done();
      });
  });
  
  
  it('Positive: successful login', done => {
    const username = '1';
    const password = '1';
    chai
      .request(server)
      .post('/login')
      .send({ username, password })
      .redirects(0)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        expect(res).to.have.status(302);
        expect(res).to.redirectTo('/home'); 
        done();
      });
  });
  it('Negative: unsuccessful register', done => {
    const username = '1234555555';
    const password = '1';
    chai
      .request(server)
      .post('/login')
      .send({ username, password })
      .redirects(0)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        expect(res).to.have.status(302);
        expect(res).to.redirectTo('/register'); 
        done();
      });
  });



 

  // ===========================================================================
  // TO-DO: Part A Login unit test case
});

