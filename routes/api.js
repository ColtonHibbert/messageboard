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
      //10 most recently bumped threads, then array of replies for each
      // should be able to use a subquery for the array of replies 
      db.select('*').from('board').where('board_name', '=', board)
      .then(data => {
        console.log(data, 'get, should get board id')
        const boardId = data[0]._id 
        
        // db.select(
        //   '_id', 'text', 'created_on', 'bumped_on', 
        //   db.select('*').from('thread').where('board_id', '=', boardId)
        //   .orderBy('bumped_on', 'desc' ).limit(10),
        //   'replycount'
        // )
        // .then(data => {
        //   console.log(data, 'data from get')
        // })
      })

    })
     
    .post(async function(req, res) {
      const board = req.params.board;
      console.log(board, 'post threads board');
      console.log(req.params, 'post threads params');
      console.log(req.query, 'post threads query');
      console.log(req.body, 'post threads body');
      //check board
      // then insert
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
        trx('thread').insert({ board_id: boardData._id, text: req.body.text, delete_password: req.body.delete_password })
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
      console.log(board, 'put threads board');
      console.log(req.params, 'put threads params');
      console.log(req.query, 'put threads query');
      console.log(req.body, 'put threads body');
    })

    .delete(async function(req ,res) {
      const board = req.params.board;
      console.log(board, 'delete threads board');
      console.log(req.params ,'delete threds params');
      console.log(req.query, 'delete threads query');
      console.log(req.body, 'delete threads body');
    })
    
  app.route('/api/replies/:board')
    .get(async function(req, res) {
      const board = req.params.board;
      console.log(board, 'get replies board');
      console.log(req.params, 'get replies params');
      console.log(req.query, 'get replies query');
      console.log(req.body, 'get replies body');
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
        .then( async data => {
          console.log(data, 'data from insert reply');
          return trx('thread').update( 'bumped_on', db.fn.now() ).where('_id', '=', Number(req.body.thread_id) )
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => console.log(err))

      return res.redirect(`/b/${board}/${req.body.thread_id}`)
    })

    .put(async function(req, res){
      const board = req.params.board;
      console.log(board, 'put replies board');
      console.log(req.params, 'put replies params');
      console.log(req.query, 'put replies query');
      console.log(req.body, 'put replies body');
    })

    .delete(async function(req, res) {
      const board = req.params.board;
      console.log(board, 'delete replies board');
      console.log(req.params, 'delete replies params');
      console.log(req.query, 'delete replies query');
      console.log(req.body, 'delete replies body');
    })

};
