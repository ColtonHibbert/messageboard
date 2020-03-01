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
const knex = require('knex');

chai.use(chaiHttp);

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('POST /api/threads/:board => create thread and send response', function(done) {
        chai.request(server)
        .post('/api/threads/board1/')
        .send({ text: 'testing text', delete_password: 'password' })
        .end(async function(err, res) {
           console.log(res.body, res.status,'res.body in post test for thread');
           assert.equal(res.status, 200);
           chai.expect(res).to.redirect;
           done();
        })
      })
      
    });
    

   
    suite('GET', function() {
      test('GET /api/threads/:board => create thread and send response', function(done) {
        chai.request(server)
        .get('/api/threads/board1')
        .end( function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'replies');
          assert.property(res.body[0], 'replycount');
          assert.isArray(res.body[0].replies);
          done();
        })
      })
    });
    
    suite('PUT', function() {

      test('PUT /api/threads/:board => response should be success', function(done) {
        async function runAsync() {
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })

          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            console.log(data, 'here should be the tread id')
            return data[0].max;
          })

          chai.request(server)
          .put('/api/threads/board1')
          .send({ report_id: threadId })
          .end( function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          })
        }
        runAsync();
        
      })

      test('PUT /api/threads/:board => response should be failed', function(done) {
    
        chai.request(server)
          .put('/api/threads/board1')
          .send({ report_id: 0 })
          .end( function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'failed');
            done();
          }) 
      })

    })
 

    suite('DELETE', function() {
      test('DELETE /api/threads/:board => delete thread, respond with success', function(done) {
         
        async function runAsync() {
          console.log('runAsync')
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })
          .catch(err => console.log(err))
          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            return data[0].max;
          })
          .catch(err => console.log(err))
          console.log(boardId, threadId, 'boardId and threadid')

          chai.request(server)
          .delete('/api/threads/board1')
          .send({ thread_id: threadId, delete_password: 'password'})
          .end( function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          })
        }

        runAsync();
      })

      test('DELETE /api/threads/:board => delete thread, respond with incorrect password', function(done) {
        
        async function runAsync() {
          
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })
          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            console.log(data, 'here should be the tread id')
            return data[0].max;
          })

          chai.request(server)
          .delete('/api/threads/board1')
          .send({ thread_id: threadId, delete_password: 'wrongpassword'})
          .end( function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'incorrect password');
            done();
          })
        }

        runAsync();

      })

    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('/api/replies/:board => insert reply and redirect', function(done) {

        async function runAsync() { 
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })

          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            console.log(data, 'here should be the thread id')
            return data[0].max;
          }) 

          chai.request(server)
          .post('/api/replies/board1')
          .send({
            thread_id: threadId,
            text: 'reply testing text',
            delete_password: 'password'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            chai.expect(res).to.redirect;
            done();
          })
        }
        runAsync();

      })
    });
    
    suite('GET', function() {
      test('/api/replies/:board => return single thread object with replies array', function(done) {

        async function runAsync() {
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })

          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            console.log(data, 'here should be the thread id')
            return data[0].max;
          }) 

          chai.request(server)
          .get('/api/replies/board1')
          .query({
            thread_id: threadId
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'replies');
            assert.property(res.body, 'replycount');
            assert.isArray(res.body.replies);
            done();
          })
        }

        runAsync();

      })
    });
    
    suite('PUT', function() {
      test('/api/replies/:board => update reported and response should be success', function(done) {
        async function runAsync() {
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })

          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            console.log(data, 'here should be the thread id')
            return data[0].max;
          })

          const replyId = await db('reply').max('_id').where('thread_id', '=', threadId )
          .then(data => {
            return data[0].max;
          })
          console.log(boardId,threadId, replyId, 'replies put, boardid threadid replyid')

          chai.request(server)
          .put('/api/replies/board1')
          .send({ 
            thread_id: threadId,
            reply_id: replyId,
          })
          .end( function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          })
        }
        runAsync();
      })

      test('/api/replies/:board => update reported and response should be failed', function(done) {

        chai.request(server)
        .put('/api/threads/board1')
        .send({ 
          thread_id: 0,
          reply_id: 0,
        })
        .end( function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'failed');
          done();
        })
    
      })

    });
    
    suite('DELETE', function() {
      test('DELETE /api/replies/:board => change reply text to [deleted], response success', function(done) {
        async function runAsync() {
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })

          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            console.log(data, 'here should be the thread id')
            return data[0].max;
          })

          const replyId = await db('reply').max('_id').where('thread_id', '=', threadId )
          .then(data => {
            return data[0].max;
          })

          chai.request(server)
          .delete('/api/replies/board1')
          .send({
            thread_id: threadId,
            reply_id: replyId,
            delete_password: 'password'
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'success');
            done();
          })
        }
        runAsync();
      })
      

      test('DELETE /api/replies/:board => change reply text to [deleted], response incorrect password', function(done) {
        async function runAsync() {
          const boardId = await db.select('_id').from('board').where('board_name', '=', 'board1')
          .then(data => {
            return data[0]._id;
          })

          const threadId = await db('thread').max('_id').where('board_id', '=', boardId )
          .then(data => {
            console.log(data, 'here should be the thread id')
            return data[0].max;
          })

          const replyId = await db('reply').max('_id').where('thread_id', '=', threadId )
          .then(data => {
            return data[0].max;
          })

          chai.request(server)
          .delete('/api/replies/board1')
          .send({
            thread_id: threadId,
            reply_id: replyId,
            delete_password: 'wrongpassword'
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'incorrect password');
            done();
          })
        }
        runAsync();
      })

    });
    
  });

});
