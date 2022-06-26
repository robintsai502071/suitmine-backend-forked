// 導入express模組
const express = require('express');
// 利用express來建立一個express application
const app = express();

const cors = require('cors');
const path = require('path');
app.use(cors());

// urlencoded 是把 data 放進 req.body 裡面！！
// 但 express 這時候還看不懂 JSON 所以 req.body 此時是一個空物件
app.use(express.urlencoded({ extended: true }));

// extended: false --> querystring 使用的套件的差異
// extended: true --> qs
// 要讓 express 認得 req 裡 json 就要再加下面這行
app.use(express.json());

// express 處理靜態資料
// 靜態資料: html, css 檔案, javascript 檔案, 圖片, 影音檔...
// express 少數內建的中間件 static
// 方法1: 不要指定網址 => 將資料夾路徑與根目錄配對
app.use(express.static(path.join(__dirname, 'uploadedByUser', 'avatar')));
// http://localhost:3001/images/test1.jpg
// 方法2: 指定網址=> 將資料夾路徑與自訂路由配對
app.use(
  '/uploadedByUser/avatar',
  express.static(path.join(__dirname, 'uploadedByUser', 'avatar'))
);

const AuthRouter = require('./routers/authRouter');
app.use('/api/auth', AuthRouter);

app.listen(3001, () => {
  console.log('Server running at port 3001');
});
