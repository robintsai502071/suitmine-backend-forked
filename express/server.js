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
      // 把 sessions 存到 express 專案的外面
      // 單純想避開 nodemon 的監控檔案變動重啟 => 記得要自己新增資料夾
      path: path.join(__dirname, '..', 'sessions'),
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

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

app.use(
  '/blog/post',
  express.static(path.join(__dirname, 'blog', 'post'))
);

// 註冊、登入、確認是否登入
const AuthRouter = require('./routers/authRouter');
app.use('/api/auth', AuthRouter);

// 會員
const MemberRouter = require('./routers/memberRouter');
app.use('/api/member', MemberRouter);

// 讓會員重新上傳大頭貼 => 修改個人資料頁面用
const ReuploadAvatarRouter = require('./routers/reuploadAvatarRouter');
app.use('/api/reupload/avatar', ReuploadAvatarRouter);

// 我的收藏新增 / 刪除
// const MyFavoritesRouter = require('./routers/myFavoritesRouter');
// app.use('/api', MyFavoritesRouter);

// 部落格
const BlogRouter = require('./routers/blogRouter');
app.use('/api/blogs', BlogRouter);

//商品列表
const productListR = require('./routers/productListR');
app.use('/api/prolist', productListR);

//商品細節顯示頁面
const prodetail = require('./routers/productdetail');
app.use('/api/prodetail', prodetail);

app.listen(3001, () => {
  console.log('Server running at port 3001');
});
