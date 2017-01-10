// 變量聲明
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

// 文件不存在時發送404錯誤
function send404(response) {
    response.writeHead(404,{"Content-Type":"text/plain"});
    response.write("Error 404: resource not found.");
    response.end();
}

// 文件數據服務
function sendFile(response, filePath, fileContents) {
    response.writeHead(200,{"Content-Type":mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

// 文件緩存
function serveStatic(response, cache, absPath) {
    if(cache[absPath]) { // 檢查文件是否緩存在內存中
        sendFile(response, absPath, cache[absPath]); // 從內存中返回文件
    }
    else {
        fs.exists(absPath, function(exists) { // 檢查文件是否存在
            if(exists) {
                fs.readFile(absPath, function(err, data) { // 從硬盤中讀取文件
                    if(err) {
                        send404(response);
                    }
                    else {
                        cache[absPath] = data; // 從硬盤中讀取文件並返回
                        sendFile(response, absPath, data);
                    }
                });
            }
            else {
                send404(response); // 發送HTTP404響應
            }
        });
    }
}

// 創建HTTP服務器
var server = http.createServer(function(request, response) {
    var filePath = false;

    if(request.url == '/') {
        filePath = 'public/index.html';
    }
    else {
        filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

// 啟動HTTP服務器
server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

// 設置Socket.IO服務器
var chatServer = require('./lib/chat_server');
chatServer.listen(server);