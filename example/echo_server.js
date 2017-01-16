var net = require('net');

var server = net.createServer(function(socket) {
    // 當讀取到新數據時處理的data事件
    socket.on('data', function(data) {
        socket.write(data);
    });
});

server.listen(8888);