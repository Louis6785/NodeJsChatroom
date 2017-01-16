var http = require('http');
var fs = require('fs');

// 客戶端請求一開始會進到這裡
http.createServer(function(req,res) {
    if(req.url == '/') {
        // 控制權轉交給了getTitles
        getTitles(res);
    }
}).listen(8000, "127.0.0.1");

// 獲取標題，並將控制權轉交給getTitles
function getTitles(res) {
    fs.readFile('./title.json',function(err, data) {
        if(err) return hadError(err, res);
        getTemplate(JSON.parse(data.toString()),res);
    });
}

// getTemplate讀取模板文件，並將控制權轉交formatHtml
function getTemplate(titles, res) {
    fs.readFile('./template.html', function(err, data) {
        if(err) return hadError(err, res);
        formatHtml(titles, data.toString(),res);
    });
}

// formatHtml得到標題和模板，渲染一個响應給客戶端
function formatHtml(titles, tmpl, res) {    
    var html = tmpl.replace('%', titles.join('</li><li>'));
    res.writeHead(200, {'Content-Type' : 'text/html'});
    res.end(html);
}

// 如果這個過程中出現了錯誤，hadError會將錯誤輸出到控制台，並給客戶端返回"Server Error"
function hadError(err, res) {
    console.error(err);
    res.end('Server Error');
}