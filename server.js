// 導入express模組
const express = require('express');
// 利用express來建立一個express application
const app = express();

const cors = require('cors');
const path = require('path');
require('dotenv').config();

app.use(
  cors({
    // 為了要讓 browser 在 CORS 的情況下，還是幫我們送 cookie
    // 這邊需要把 credentials 設定成 true，而且 origin 不可以是 *
    // 不然就太恐怖，誰都可以跨源讀寫 cookie
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);

const expressSession = require('express-session');
let FileStore = require('session-file-store')(expressSession);
app.use(
  expressSession({
    store: new FileStore({
      // 將 session 檔案存於根目錄
      path: path.join(__dirname),
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for Heroku
    name: 'suitmine', // This needs to be unique per-host.
    cookie: {
      secure: true, // required for cookies to work on HTTPS
      httpOnly: false,
      sameSite: 'none',
    },
  })
);

// urlencoded 是把 data 放進 req.body 裡面
// 但 express 這時候還看不懂 JSON 所以 req.body 此時是一個空物件
app.use(express.urlencoded({ extended: true })); // extended 是 true 或 false 為使用的套件的差異

// extended: false --> querystring
// extended: true --> qs

// 要讓 express 認得 req 裡 json 就要再加下面這行
app.use(express.json());

// ↓↓↓↓↓↓↓↓ 2022.09 因將佈署至 Heroku 靜態檔案將無法再存放，故註解不再使用 ↓↓↓↓↓↓↓↓

// express 處理靜態資料
// 靜態資料: html, css 檔案, javascript 檔案, 圖片, 影音檔...
// express 少數內建的中間件 static
// 方法1: 不要指定網址 => 將資料夾路徑與根目錄配對
// app.use(express.static(path.join(__dirname, 'uploadedByUser', 'avatar')));
// http://localhost:3001/images/test1.jpg
// 方法2: 指定網址=> 將資料夾路徑與自訂路由配對
// app.use(
//   '/uploadedByUser/avatar',
//   express.static(path.join(__dirname, 'uploadedByUser', 'avatar'))
// );

// app.use(
//   '/uploadedByUser/updatedAvatar',
//   express.static(path.join(__dirname, 'uploadedByUser', 'updatedAvatar'))
// );

// app.use('/blog/post', express.static(path.join(__dirname, 'blog', 'post')));

// app.use(
//   '/blog/thumbnail',
//   express.static(path.join(__dirname, 'blog', 'thumbnail'))
// );
// ↑↑↑↑↑↑↑↑ 2022.09 因將佈署至 Heroku 靜態檔案將無法再永久存放，故註解不再使用 ↑↑↑↑↑↑↑↑

// 註冊、登入、確認是否登入

const AuthRouter = require('./routers/authRouter');
app.use('/api/auth', AuthRouter);

// 會員
const MemberRouter = require('./routers/memberRouter');
app.use('/api/member', MemberRouter);

//商品列表
const productListRouter = require('./routers/productListRouter');
app.use('/api/products', productListRouter);

//商品細節顯示頁面
const ProdetailRouter = require('./routers/productDetailRouter');
app.use('/api/products', ProdetailRouter);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running at port ${process.env.PORT || 3001}`);
});
