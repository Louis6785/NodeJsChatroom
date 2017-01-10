var Chat = function(socket) {
    this.socket = socket;
};

// 發送聊天消息
Chat.prototype.sendMessage = function(room, text) {
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
};

// 變更房間
Chat.prototype.changeRoom = function(room) {
    this.socket.emit('join', {
        newRoom : room
    });
};

// 處理聊天命令
Chat.prototype.processCommand = function(command) {
    var words = command.split(' ');
    // 從第一個單字開始解析命令
    var command = words[0]
                    .substring(1, words[0].length)
                    .toLowerCase();
    var message = false;

    switch(command) {
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'Unrecognized command.';
            break;
    }

    return message;
};