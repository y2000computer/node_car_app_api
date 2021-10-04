var express = require('express');
var router = express.Router();
var path = require("path")
var fs = require('fs');
var xSea = require('../../lib/xSea');

router.use((req, res, next) => { req.p = req.originalUrl.split('/'); next(); });
router.use('/testing', async (req, res, next) => { 
    res.send(await xSea.Init());
});
router.use('/webhook-update', function (req, res, next) {
    var cp = require('child_process');
    var t1 = [];
    function stdout(data) { console.log(`${data}`); t1.push(`${data}`); }
    function stderr(data) { console.log(`${data}`); t1.push(`${data}`); }
    function run(cmd, val, cb) {
        console.log(`> ${cmd} ${val}`);
        var sp = cp.spawn(cmd, val.split(' '));
        sp.stdout.on('data', stdout);
        sp.stderr.on('data', stderr);
        sp.on('close', cb);//TEST
    }
    console.log('==============[ UPDATE START ]==============');
    // stop();
    // function stop() {
    //     console.log('> pm2 stop --watch 0');
    //     cp.exec('pm2 stop --watch 0', reset);
    // }
    reset();
    function reset() { run('git', 'reset --hard HEAD', fetch); }
    function fetch() { run('git', 'fetch --all', pull); }
    function pull() { run('git', 'pull', restart); }
    function restart() {
        console.log('==============[ UPDATE COMPLETE ]==============');
        console.log('==============[ UPDATE RESTARTING ]==============');
        res.json({ result: t1.join('') });
        run('pm2', 'restart all', reset);
    }
});

module.exports = router;