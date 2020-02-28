/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('POST /api/threads/:board => create thread and send response', function(done) {
        chai.request(server)
        .post('/api/threads/board1/')
        .send({ text: 'testing text', delete_password: 'password' })
        .end(async function(err, res) {
          //res is a redirect, the below won't work, how do I test then?
          // console.log(res.body, 'res.body in post test for thread')
          // assert.equal(res.status, 200);
          // assert.property(res.body[0], '_id');
          // assert.property(res.body[0], 'text');
          // assert.property(res.body[0], 'created_on');
          // assert.property(res.body[0], 'bumped_on');
          // assert.property(res.body[0], 'replies');
          // assert.property(res.body[0], 'replycount');
          // assert.isArray(res.body[0].replies);
          // done();
        })
      })
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
