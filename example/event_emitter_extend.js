// Watcher類別的構造器
function Watcher(watchDir, processedDir) {
  this.watchDir = watchDir;
  this.processedDir = processedDir;
}

// 添加繼承事件發射器行為
var events = require('events')
  , util = require('util');

util.inherits(Watcher, events.EventEmitter);

var fs = require('fs');
var watchDir = './watch';
var processedDir = './done';

// 擴展EventEmitter，添加處理文件的方法
Watcher.prototype.watch = function() {
    // 保存對watcher對象的引用，以便在回調函數readdir中使用
    var watcher = this;
    fs.readdir(this.watchDir, function(err, files) {
        if(err) throw err;
        // 處理watch目錄中的所有文件
        for(var index in files) {
            watcher.emit('process', files[index]);
        }
    });
}

// 擴展EventEmitter，添加開始監控的方法
Watcher.prototype.start = function() {
    var watcher = this;
    fs.watchFile(watchDir, function() {
        watcher.watch();
    });
}

var watcher = new Watcher(watchDir, processedDir);

// 設定文件的處理邏輯
watcher.on('process', function(file) {
    var watchFile = this.watchDir + '/' + file;
    var processedFile = this.processedDir + '/' + file.toLowerCase();

    fs.rename(watchFile, processedFile, function(err) {
        if(err) throw err;
    });
});

// 啟動對目錄的監控
watcher.start();