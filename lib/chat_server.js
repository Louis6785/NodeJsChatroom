// 聊天狀態變量
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

// 啟動Socket.IO服務器
exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function(socket) {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'Lobby');
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        socket.on('rooms', function(){
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket, nickNames, namesUsed);
    });
};

// 分配用戶暱稱
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    // 生成新暱稱
    var name = 'Guest' + guestNumber;
    // 把用戶暱稱跟客戶端連接ID關聯上
    nickNames[socket.id] = name;
    // 讓用戶知道他們的暱稱
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    // 存放已經被佔用的暱稱
    namesUsed.push(name);
    // 增加用來生成暱稱的計數器
    return guestNumber + 1;
}

// 進入聊天室
function joinRoom(socket, room) {
    // 讓用戶進入房間
    socket.join(room);
    // 紀錄用戶的當前房間
    currentRoom[socket.id] = room;
    // 讓用戶知道他們進入了新的房間
    socket.emit('joinResult', {room: room});
    // 讓房間裡的其他用戶知道有新用戶進入了房間
    socket.broadcast.to(room).emit('message',{
        text: nickNames[socket.id] + ' has joined ' + room + '.'
    });
    // 確定有哪些用戶在這個房間裡
    var usersInRoom = io.sockets.clients(room);
    // 如果不止一個用戶在這個房間，匯總下都是誰
    if(usersInRoom.length > 1) {
        var usersInRoomSummary = 'Users currently in ' + room + ': ';
        for(var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id) {
                if(index > 0) {
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';    
        // 將房間裡其他用戶的匯總發送給這個用戶
        socket.emit('message', {text: usersInRoomSummary});
    }    
}

// 更改暱稱
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    // 添加nameAttempt事件的監聽器
    socket.on('nameAttempt', function(name) {
        // 暱稱不能以Guest開頭
        if(name.indexOf('Guest') == 0) {
            socket.emit('nameResult' ,{
                success: false,
                message: 'Names cannot begin with "Guest".'
            });
        }
        else
        {
            // 如果暱稱還沒註冊就註冊上
            if(namesUsed.indexOf(name) == -1) {
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                // 刪掉之前用的暱稱，讓其他用戶可以使用
                delete namesUsed[previousNameIndex];
                socket.emit('nameResult', {
                    success: true,
                    name: name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text: previousName + ' is now known as ' + name + '.'
                });
            }
            else
            {
                // 如果暱稱已經被佔用，給客戶端發送錯誤消息
                socket.emit('nameResult', {
                    success: false,
                    message: 'That name is already in use.'
                });
            }
        }       
    });   
}

// 發送聊天消息
function handleMessageBroadcasting(socket) {
    socket.on('message', function(message) {
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });
    });
}

// 創建房間
function handleRoomJoining(socket) {
    socket.on('join', function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}

// 用戶斷開連接
function handleClientDisconnection(socket) {
    socket.on('disconnect', function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}