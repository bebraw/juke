var komponist = require('komponist');
var static = require('node-static');
var icecast = require('icecast');

try { net = require('net'); } catch(e) {}

var http = require('http');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var url = require('url');

main(require('./conf.json'));

function main(conf) {
    var file = new(static.Server)('./public');

    var server = http.createServer(function(req, res) {
        if(req.url.indexOf('/channel_meta?') === 0) {
            var pquery = querystring.parse(url.parse(req.url).query);
            res.writeHead(200, {'Content-Type': 'application/javascript'});

            if(!pquery.url) return;

            icecast.get(pquery.url, function(ires) {
              res.end(JSON.stringify(ires.headers));
            });

            return;
        }
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
