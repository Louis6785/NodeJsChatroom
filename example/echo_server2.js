var net = require('net');

var server = net.createServer(function(socket) {
    // data事件只被處理一次
    socket.once('data', function(data) {
        socket.write(data);
    });
});

server.listen(8888);