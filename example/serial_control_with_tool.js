var flow = require('nimble');

// 給Nimble一個函數數據，讓他一個接一個地執行
flow.series([
    function(callback) {
        setTimeout(function() {
            console.log('I execute first.');
            callback();
        }, 1000);
    },
    function(callback) {
        setTimeout(function() {
            console.log('I execute next.');
            callback();
        }, 500);
    },
    function(callback) {
        setTimeout(function() {
            console.log('I execute last.');
            callback();
        }, 100);
    }
]);