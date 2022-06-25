// 導入express模組
const express = require('express');
// 利用express來建立一個express application
const app = express();

// urlencoded 是把 data 放進 req.body 裡面！！
// 但 express 這時候還看不懂 JSON 所以 req.body 此時是一個空物件
app.use(express.urlencoded({ extended: true }));

// extended: false --> querystring 使用的套件的差異
// extended: true --> qs

// 要讓 express 認得 req 裡 json 就要再加下面這行
app.use(express.json());

app.listen(3001, () => {
  console.log('Server running at port 3001');
});