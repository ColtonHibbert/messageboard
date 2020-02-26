/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(async function (req, res) {
      const board = req.params.board;
      console.log(board, 'get threads board');
      console.log(req.params, 'threads get params');
      console.log(req.query, 'threads get query');
      console.log(req.body, 'threads get body');

    })
     
    .post(async function(req, res) {
      const board = req.params.board;
      console.log(board, 'post threads board');
      console.log(req.params, 'post threads params');
      console.log(req.query, 'post threads query');
      console.log(req.body, 'post threads body');
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
