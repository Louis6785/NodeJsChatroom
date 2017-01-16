var http = require('http');
var fs = require('fs');

// 創建HTTP服務器並用回調定義响應邏輯
http.createServer(function(req,res) {
    if(req.url == '/') {
        // 讀取JSON文件並用回調定義如何處理其中的內容
        fs.readFile('./title.json',function(err, data) {
            // 如果出錯，輸出錯誤日誌，並給客戶端返回"Server Error"
            if(err) {
                console.error(err);
                res.end('Server Error');
            }
            else {
                // 從JSON文本中解析數據
                var titles = JSON.parse(data.toString());

                // 讀取HTML模板，並在加載完成後使用回調
                fs.readFile('./template.html', function(err, data) {
                    if(err) {
                        console.error(err);
                        res.end('Server Error');
                    }
                    else {
                        var tmpl = data.toString();

                        // 組裝HTML頁面以顯示博客標題
                        var html = tmpl.replace('%', titles.join('</li><li>'));
                        res.writeHead(200, {'Content-Type' : 'text/html'});
                        // 將HTML頁面發送給用戶
                        res.end(html);
                    }
                });
            }
        });
    }
}).listen(8000, "127.0.0.1");