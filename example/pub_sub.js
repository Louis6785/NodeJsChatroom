var events = require('events');
var net = require('net');

var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};
channel.setMaxListeners(50);

channel.on('join', function(id, client) {
    var welcome = "Welcome!\n" 
                + 'Guests online: ' + this.listeners('broadcast').length;
    client.write(welcome + "\n");
    // 添加join事件的監聽器，保存用戶的client對象，以便程序可以將數據發送給用戶
    this.clients[id] = client;
    this.subscriptions[id] = function(senderId, message) {
        // 忽略發出這一個廣播數據的用戶
        if(id != senderId) {
            this.clients[id].write(message);
        }        
    }
    // 添加一個專門針對當前用戶的broadcast事件監聽器
    this.on('broadcast', this.subscriptions[id]);
});

// 創建leave事件的監聽器
channel.on('leave', function(id) {
    // 移除指定客戶端的broadcast監聽器
    channel.removeListener('broadcast', this.subscriptions[id]);
    channel.emit('broadcast', id, id + " has left the chat.\n");
});

channel.on('shutdown', function() {
    channel.emit('broadcast', '', "Chat has shut down.\n");
    channel.removeAllListeners('broadcast');
});

var server = net.createServer(function(client) {
    var id = client.remoteAddress + ':' + client.remotePort;
    // 當有用戶連到服務器上來時發出一個join事件，指明用戶ID和client對象
    client.on('connect', function() {
        channel.emit('join', id, client);
    });
    // 當有用戶發送數據時，發出一個頻道broadcast事件，指明用戶ID和消息
    client.on('data', function(data) {
        data = data.toString();
        if(data == "shutdown\r\n") {
            channel.emit('shutdown');
        }
        channel.emit('broadcast', id, data);
    });
    // 在用戶斷開連接時發出leave事件
    client.on('close', function() {
        channel.emit('leave', id);
    });
});

server.listen(8888);