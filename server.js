var komponist = require('komponist');
var express = require('express');
var shoe = require('shoe');

try { net = require('net'); } catch(e) {}

var http = require('http');
var path = require('path');
var fs = require('fs');

main(require('./conf.json'));

function main(conf) {
    var server = express();

    server.configure(function() {
        server.use(express.logger())
            .use(express.static(__dirname + '/public'));
    });

    server.get('/', function(req, res) {
        res.redirect('index.html');
    });

    var serv = server.listen(conf.ports.server, function() {
        console.log('juke server running at port ' + conf.ports.server);
    });

    installKomponist(serv, conf.ports.mpd);
}

function installKomponist(server, port) {
     var sock = shoe(function(stream) {
        var client = net.createConnection('localhost', port);

        client.pipe(stream);

        stream.on('data', function(data) {
            client.write(data);
        });
    });

    sock.install(server, '/komponist');
}
