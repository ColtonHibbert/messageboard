/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

module.exports = function (app, db) {
  
  app.route('/api/threads/:board')
    .get(async function (req, res) {
      const board = req.params.board;
      console.log(board, 'get threads board');
      console.log(req.params, 'threads get params');
      console.log(req.query, 'threads get query');
      console.log(req.body, 'threads get body');
    
      db.select('*').from('board').where('board_name', '=', board)
      .then(data => {
        console.log(data, 'get, should get board id');
        const boardId = data[0]._id ;

         db.select('_id', 'text', 'created_on', 'bumped_on', 'replycount')
        .from('thread').where('board_id', '=', boardId)
        .orderBy('bumped_on', 'desc' ).limit(10)
        .then(async data => {
          console.log(data, 'data from get')
          async function responseCreator() {
            let buildResponse = data;
            for(let i = 0; i < buildResponse.length; i++) {
              let replyReponse = null;
              await db.select('_id', 'text', 'created_on').from('reply').where('thread_id', '=', buildResponse[i]._id)
              .orderBy('created_on', 'desc').limit(3)
              .then(data => {
                console.log(data, 'data from reply');
                replyReponse = data;
              })
              buildResponse[i].replies = replyReponse;
            }
            console.log(buildResponse, 'here is the build response');
            res.json(buildResponse);
          }
          responseCreator();
        })
        .catch(err => console.log(err))
      })

    })
     
    .post(async function(req, res) {
      const board = req.params.board;
      console.log(board, 'post threads board');
      console.log(req.params, 'post threads params');
      console.log(req.query, 'post threads query');
      console.log(req.body, 'post threads body');
      let boardData = await db.select('*').from('board').where('board_name', '=', board)
      .then(data => {
        console.log(data, 'data for checking board_name');
        return data[0];
      })
      .catch(err => console.log(err))

      function insertBoard() {
        if(boardData === undefined) {
          return db.transaction(trx => {
            trx('board').insert({board_name: board})
            .returning('*')
            .then(data => {
              console.log(data, 'data from insert board_name');
              boardData = data[0];
            })
            .then(trx.commit)
            .catch(trx.rollback)
          })
          .catch(err => console.log(err))
        }
      }

      await insertBoard();

      await db.transaction(trx => {
        trx('thread').insert({ board_id: boardData._id, text: req.body.text, delete_password: req.body.delete_password }, ['*'])
        .then(data => {
          console.log(data, 'data in thread insert')
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => console.log(err))

      return res.redirect(`/b/${board}`);

    })

    .put(async function(req, res) {
      const board = req.params.board;
      const threadId = Number(req.body.report_id);
      console.log(board, 'put threads board');
      console.log(req.params, 'put threads params');
      console.log(req.query, 'put threads query');
      console.log(req.body, 'put threads body');
      db.transaction(trx => {
        trx('thread').update({ reported: true }).returning('_id', 'reported').where('_id', '=', threadId)
        .then(data => {
          console.log(data, 'data for update thread');
          if(data[0] !== undefined ) {
            res.json('success');
          }
          if(data[0] === undefined ) {
            res.json('failed');
          }
        })
        .then(trx.commit)
        .catch(err => {
          console.log(err, 'error in thread put/update');
          trx.rollback;
          res.json('failed');
        })
      })
    })

    .delete(async function(req ,res) {
      const board = req.params.board;
      const threadId = Number(req.body.thread_id);
      const deletePassword = req.body.delete_password;
      console.log(board, 'delete threads board');
      console.log(req.params ,'delete threds params');
      console.log(req.query, 'delete threads query');
      console.log(req.body, 'delete threads body');

      db.transaction(trx => {
        trx('thread').returning('*').where('_id', '=', threadId).andWhere('delete_password', '=', deletePassword).del()
        .then(data => {
          console.log(data, 'here is the deleted thread');
          if(data[0] !== undefined) {
            res.json('success');
          }
          if(data[0] === undefined ) {
            res.json('incorrect password');
          }
        })
        .then(trx.commit)
        .catch(err => {
          console.log(err, 'error in thread delete');
          trx.rollback;
          res.json('incorrect password');
        })
      })
      .catch(err => console.log(err, 'error in thread delete last catch'))

    })
    
  app.route('/api/replies/:board')
    .get(async function(req, res) {
      const board = req.params.board;
      const threadId = Number(req.query.thread_id);
      console.log(board, 'get replies board');
      console.log(req.params, 'get replies params');
      console.log(req.query, 'get replies query');
      console.log(req.body, 'get replies body');
      db.select('_id', 'text', 'created_on', 'bumped_on', 'replycount').from('thread').where('_id', '=', threadId)
      .then(async data => {
        let thread = data[0];
        db.select('_id', 'text', 'created_on').from('reply').where('thread_id', '=', threadId)
        .then(data => {
          console.log(data, 'here is the data from get replies');
          thread.replies = data;
          console.log(thread, 'here is thread and should have replies');
          res.json(thread);
        })
      })
      
    })

    .post(async function(req, res) {
      const board = req.params.board;
      console.log(board, 'post replies board');
      console.log(req.params, 'post replies params');
      console.log(req.query, 'post replies query');
      console.log(req.body, 'post replies body');
      await db.transaction(trx => {
        trx('reply').insert({ thread_id: Number(req.body.thread_id), text: req.body.text , delete_password: req.body.delete_password })
        .returning('*')
        .then( data => {
          console.log(data, 'data from insert reply');
          return trx('thread').update('bumped_on', db.fn.now()).increment('replycount', 1).where('_id', '=', Number(req.body.thread_id) )
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => console.log(err))

      return res.redirect(`/b/${board}/${req.body.thread_id}`)
    })

    .put(async function(req, res){
      const board = req.params.board;
      const threadId = req.body.thread_id;
      const replyId = req.body.reply_id;
      console.log(board, 'put replies board');
      console.log(req.params, 'put replies params');
      console.log(req.query, 'put replies query');
      console.log(req.body, 'put replies body');
      db.transaction(trx => {
        trx('reply').update({ reported: true }).returning('_id', 'reported').where('_id', '=', replyId )
        .then(data => {
          console.log(data, 'data in put reply');
          if(data[0] !== undefined) {
            res.json('success');
          }
          if(data[0] === undefined ) {
            res.json('failed');
          }
        })
        .then(trx.commit)
        .catch(err => {
          console.log(err, 'error in put reply');
          trx.rollback;
          res.json('failed');
        })
      })
    })

    .delete(async function(req, res) {
      const board = req.params.board;
      const replyId = Number(req.body.reply_id);
      const threadId = Number(req.body.thread_id);
      const deletePassword = req.body.delete_password;
      console.log(board, 'delete replies board');
      console.log(req.params, 'delete replies params');
      console.log(req.query, 'delete replies query');
      console.log(req.body, 'delete replies body');
      db.transaction(trx => {
        trx('reply').update({ text: '[deleted]'}).returning('*').where('_id', '=', replyId).andWhere('delete_password', '=', deletePassword)
        .then(data => {
          console.log(data, 'data in delete replies');
          if(data[0] !== undefined) {
            res.json('success');
          }
          if(data[0] === undefined) {
            res.json('incorrect password');
          }
        })
        .then(trx.commit)
        .catch(err => {
          console.log(err, 'err in thread delete text/ change text to [deleted]');
          trx.rollback;
          res.json('incorrect password');
        })
      })
      .catch(err => console.log(err, 'last catch in delete reply text/change to [deleted]'))

    })

};
