var komponist = require('komponist');

var http = require('http');

main({
    ports: {
        server: 8000,
        mpd: 6600
    }
});

function main(conf) {
    var server = http.createServer(function(req, rs) {
        if(req.url === '/') {
            // TODO: serve index now
            console.log('serve index');
        }
    });

    server.listen(conf.ports.server, function() {
        console.log('juke server running at port ' + conf.ports.server);
    });

    komponist.install(server, 'localhost', conf.ports.mpd);
}
