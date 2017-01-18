var fs = require('fs');
var completedTasks = 0;
var tasks = [];
var wordCounts = {};
var filesDir = './text';

function checkIfComplete() {
    completedTasks++;
    if(completedTasks == tasks.length) {
        // 當所有任務全部完成後，列出文件中用到的每個單詞以及用了多少次
        for(var index in wordCounts) {
            console.log(index + ': ' + wordCounts[index]);
        }
    }
}

function countWordsInText(text) {
    var words = text
                .toString()
                .toLowerCase()
                .split(/\W+/)
                .sort();

    // 對文本中出現的單詞計數
    for(var index in words) {
        var word = words[index];
        if(word) {
            wordCounts[word] = (wordCounts[word]) ? wordCounts[word] + 1 : 1;
        }
    }
}

// 得到text目錄中的文件列表
fs.readdir(filesDir, function(err, files) {
    if(err) throw err;
    // 定義處理每個文件的任務。每個任務中都會調用一個異步讀取文件的函數並對文件中使用的單詞計數
    for(var index in files) {
        var task = (function(file) {
            return function() {
                fs.readFile(file, function(err, text) {
                    if(err) throw err;
                    countWordsInText(text);
                    checkIfComplete();
                });
            }
        })(filesDir + '/' + files[index]);
        // 把所有任務都添加到函數調用數組中
        tasks.push(task);
    }
    // 開始並行執行所有任務 
    for(var task in tasks) {
        tasks[task]();
    }
}); 