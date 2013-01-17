var komponist = require('komponist');

var client = komponist.createConnection(function(err, client) {
    console.log('Connected to MPD!');
});

window.komponist = client;
