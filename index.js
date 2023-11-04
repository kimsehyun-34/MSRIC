const express = require('express');
const app = express();

app.use('/public', express.static('public'));

app.listen(8080, '0.0.0.0');

console.log('실행: http://localhost:8080');

//--
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/main.html')
});

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/public/html/login.html')
});
