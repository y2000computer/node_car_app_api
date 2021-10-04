var express = require('express');
var router = express.Router();

router.route('/login')
    .get(function (req, res) {
        res.send('login ' + req.method);
    })
    .post(function (req, res) {
        res.send('login ' + req.method);
    })
    .put(function (req, res) {
        res.send('login ' + req.method);
    });

router.route('/reg')
    .get(function (req, res) {
        res.send('reg ' + req.method);
    })
    .post(function (req, res) {
        res.send('reg ' + req.method);
    })
    .put(function (req, res) {
        res.send('reg ' + req.method);
    });

module.exports = router;