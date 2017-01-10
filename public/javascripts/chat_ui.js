// 顯示可疑的文本
function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

// 顯示系統創建的內容
function divSystemContentElement(message) {
    return $('<div></div>').html('<i>'+ message +'</i>');
}

// 處理原始的用戶輸入
function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;
    debugger;
    // 如果用戶輸入的內容以斜槓(/)開頭，將其作為聊天命令
    if(message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if(systemMessage) {
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    }
    else
    {
        // 將非命令輸入廣播給其他用戶
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }

    $('#send-message').val('');
}

// 客戶端程序初始化邏輯
var socket = io.connect();

$(document).ready(function(){
    var chatApp = new Chat(socket);
    // 顯示更名嘗試的結果
    socket.on('nameResult', function(result) {
        var message;

        if(result.success) {
            message = 'You are now known as ' + result.name + '.';
        }
        else
        {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });

    // 顯示房間變更結果
    socket.on('joinResult', function(result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });

    // 顯示接受到的消息
    socket.on('message', function(message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });

    // 顯示可用房間列表
    socket.on('rooms', function(rooms) {
        $('#room-list').empty();

        for(var room in rooms) {
            room = room.substring(1, room.length);
            if(room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        // 點擊房間名可以換到哪個房間
        $('#room-list div').click(function(){
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });
    // 定期請求可用房間列表
    setInterval(function(){
        socket.emit('rooms');
    }, 1000);

    $('#send-message').focus();
    // 提交表單可以發送聊天消息
    $('#send-form').submit(function(){        
        processUserInput(chatApp, socket);
        return false;
    });
});