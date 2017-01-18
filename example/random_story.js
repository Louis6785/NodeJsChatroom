var fs = require('fs');
var request = require('request');
var htmlparser = require('htmlparser');
var configFilename = './rss_feeds.txt';

// 任務1. 確保包含RSS預定源URL列表的文件存在
function checkForRSSFile() {
    fs.exists(configFilename, function(exists) {
        // 只要有錯誤就盡早返回
        if(!exists)
            return next(new Error('Missing RSS file: ' + configFilename));

        next(null, configFilename);
    });
}

// 任務2. 讀取並解析包含預定源URL的文件
function readRSSFile(configFilename) {
    fs.readFile(configFilename, function(err, feedList) {
        if(err) return next(err);

        // 將預定源URL列表轉換成字符串，然後分隔成一個數組
        feedList = feedList
                    .toString()
                    .replace(/^\s+|\s+$/g, '')
                    .split("\n");

        // 從預定源URL數組中隨機選擇一個預定源URL
        var random = Math.floor(Math.random() * feedList.length);
        next(null, feedList[random]);
    });
}

// 任務3. 向選定的預定源發送HTTP請求以獲取數據
function downloadRSSFeed(feedUrl) {
    request({uri: feedUrl}, function(err, res, body) {
        if(err) return next(err);
        if(res.statusCode != 200) 
            return next(new Error('Abnormal response status code'));

        next(null, body);
    });
}

// 任務4. 將預定源數據解析到一個條目數組中
function parseRSSFeed(rss) {
    var handler = new htmlparser.RssHandler();
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rss);
    
    if(handler.dom.items == undefined || !handler.dom.items.length)
        return next(new Error('NO RSS items found'));

    var item = handler.dom.items.shift();
    console.log(item.title);
    console.log(item.link);
}

// 把所有要做的任務按執行順序添加到一個數組中
var tasks = [
    checkForRSSFile,
    readRSSFile,
    downloadRSSFeed,
    parseRSSFeed
];

// 負責執行任務的next函數
function next(err, result) {
    // 如果任務出錯，則拋出異常
    if(err) throw err;

    // 從任務數組中取出下個任務
    var currentTask = tasks.shift();

    // 執行當前任務
    if(currentTask) {
        currentTask(result);
    }
}

// 開始任務的串行化執行
next();