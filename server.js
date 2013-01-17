var komponist = require('komponist');
var express = require('express');

var http = require('http');
var path = require('path');
var fs = require('fs');

main(require('./conf.json'));

function main(conf) {
    var server = express();

    server.configure(function() {
        server.use(express.logger(__dirname + '/dev'))
            .use(express.static(__dirname + '/public'));
    });

    server.listen(conf.ports.server, function() {
        console.log('juke server running at port ' + conf.ports.server);
    });

    server.get('/', function(req, res) {
        res.redirect('index.html');
    });

    komponist.install(server, 'localhost', conf.ports.mpd);
}
