var komponist = require('komponist');

var http = require('http');
var path = require('path');
var fs = require('fs');

main({
    ports: {
        server: 8000,
        mpd: 6600
    }
});

function main(conf) {
    var server = http.createServer(function(req, res) {
        if(req.url === '/') req.url = 'html/index.html';
        req.url = req.url.replace(/^\//g, '');

        if(!startsWith(req.url, ['html', 'js', 'css'])) return;
        filename = path.resolve(__dirname, req.url);

        fs.exists(filename, function(exists) {
            if(!exists) {
                return res.end('404');
            }

            fs.createReadStream(filename).pipe(res);
        });
    });

    server.listen(conf.ports.server, function() {
        console.log('juke server running at port ' + conf.ports.server);
    });

    komponist.install(server, 'localhost', conf.ports.mpd);
}

function startsWith(str, choices) {
    return choices.filter(function(v) {
        return str.indexOf(v) === 0;
    }).length > 0;
}
