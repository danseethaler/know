var fs = require('fs');
var path = require('path');

try {
    fs.mkdirSync(path.join(__dirname, 'user_data1'))
}
catch (e){
    if (e.code !== 'EEXIST') throw e;
}

var filename = path.join(__dirname, 'user_data1/', 'userId') + '.json';

fs.writeFile(filename, JSON.stringify("{'awesome': true}", null, 4), function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('./user_data/' + 'userId' + '.json - File successfully written');
    }
})
