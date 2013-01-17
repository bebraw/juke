var komponist = require('komponist');

var client = komponist.createConnection(function(err, client) {
    if(err) throw err;

    console.log('Connected to MPD!');
});

window.komponist = client;
