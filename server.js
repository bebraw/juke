var komponist = require('komponist');
var static = require('node-static');

try { net = require('net'); } catch(e) {}

var http = require('http');
var path = require('path');
var fs = require('fs');

main(require('./conf.json'));

function main(conf) {
    var file = new(static.Server)('./public');

    var server = http.createServer(function(req, res) {
        if(req.url === '/') req.url = 'index.html';

        req.addListener('end', function() {
            file.serve(req, res);
        });
    });

    var serv = server.listen(conf.ports.server, function() {
        console.log('juke server running at port ' + conf.ports.server);
    });

    installKomponist(serv, conf.ports.mpd);
}

function installKomponist(server, port) {
    komponist.install(server, 'localhost', port);
}
