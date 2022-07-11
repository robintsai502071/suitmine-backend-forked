// express router 起手式三行
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
// 引入驗證、雜湊套件
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// 引入圖片處理套件 for image upload
const multer = require('multer');
// 引入 node.js 內建 path，(圖片儲存位置會用到)
const path = require('path');
require('dotenv').config();

// 設定圖片儲存位置
const storage = multer.diskStorage({
  // 設定儲存目的地(檔案夾)
  // 就是要這要寫，套件規定的
  destination: function (req, file, cb) {
    // cb 的第一個參數是給 error，這邊單純存圖片，沒什麼錯誤就給 NULL
    // 第二個參數指定圖片上傳到什麼位址，這邊設定要放在根目錄下的 uploadedByUser/avatar
    cb(null, path.join(__dirname, '..', 'uploadedByUser', 'avatar'));
  },
  // 重新命名使用者上傳的圖片名稱
  filename: function (req, file, cb) {
    let ext = file.originalname.split('.').pop();
    let newFilename = `${Date.now()}.${ext}`;
    cb(null, newFilename);
    // file
    // {
    //   fieldname: 'photo',
    //   originalname: 'japan04-200.jpg',
    //   encoding: '7bit',
    //   mimetype: 'image/jpeg'
    // }
  },
});

// 這是一個中間件
const uploader = multer({
  //設定儲存位置
  storage: storage,
  // 過濾檔案類型
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/png'
    ) {
      cb('這不是可被接受的格式!', false);
    } else {
      cb(null, true);
    }
  },
  // 檔案尺寸的過濾
  limits: {
    // 1k = 1024
    fileSize: 200 * 1024,
  },
});

// 宣告驗證規則，這些規則都是中介程式
const registerRules = [
  body('email').isEmail().withMessage('請填寫正確 Email 格式'),
  body('password').isLength({ min: 8 }).withMessage('密碼長度至少為 8'),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('密碼不一致'),
];

// /api/auth/register
router.post(
  '/register',
  uploader.single('photo'), // 接收來自名為 photo 欄位的「單一」上傳檔案，並將檔案資訊存放在 req.file 上
  registerRules,
  async (req, res, next) => {
    // TODO: 確認 email 有沒有註冊過
    let [result] = await pool.execute('SELECT * FROM user WHERE email = ?', [
      req.body.email,
    ]);
    if (result.length > 0)
      return res.status(400).json({ error: '此信箱已被註冊過！' });

    // TODO: 驗證資料欄位，會回傳一個陣列，若沒有驗證錯誤會回傳空陣列
    const validateResults = validationResult(req);
    // 不是 empty --> 表示有欄位沒通過驗證; 這邊 .isEmpty()、.array() 都是套件提供
    if (!validateResults.isEmpty()) {
      // 蒐集驗證失敗結果轉為一個陣列
      let error = validateResults.array();
      // 回傳失敗結果給前端
      return res.status(400).json({ errorColumns: error });
    }

    // 將前端送來的密碼進行雜湊
    let hashPassword = await bcrypt.hash(req.body.password, 10);

    // 圖片處理完成後，會被放在 req 物件裡
    // 最終前端需要的網址: http://localhost:3001/uploadedByUser/avatar/xxxxxxx.jpg
    // 可以由後端來組合這個網址，也可以由前端來組合
    // 記得不要把 http://locahost:3001 這個存進資料庫，因為正式環境部署會不同
    // 目前這個專案採用：儲存 avatar/xxxxxxx.jpg 這樣格式
    // 使用者不一定有上傳圖片，所以要確認 req 是否有 file

    // ? process.env.BASE_URL + '/uploadedByUser/avatar/' + req.file.filename
    let photo = req.file
      ? 'http://localhost:3001' + '/uploadedByUser/avatar/' + req.file.filename
      : '';

    // TODO: user 資料寫進資料庫
    let [response] = await pool.execute(
      'INSERT INTO user (name, email, passwords, gender, age, photo) VALUES (?,?,?,?,?,?)',
      [
        req.body.username,
        req.body.email,
        hashPassword,
        req.body.gender,
        req.body.age,
        photo,
      ]
    );

    // response
    res.json({ response: '註冊成功！', response });
  }
);

// /api/auth/login
router.post('/login', async (req, res, next) => {
  // 確認資料有收到
  // 確認有沒有這個帳號
  let [user] = await pool.execute(
    'SELECT id, name ,email, passwords, photo FROM user WHERE email = ?',
    [req.body.email]
  );

  // user 撈出來是一個陣列，有撈到資料代表有註冊過
  if (user.length === 0) {
    // 如果沒有註冊過就回覆錯誤
    return res.status(400).json({ error: '帳號或密碼錯誤' });
  }

  user = user[0];

  // 如果有，確認密碼(用 bcrypt 雜湊套件提供的方法)
  let passwordCompareResult = await bcrypt.compare(
    req.body.password,
    user.passwords
  );

  if (passwordCompareResult === false) {
    return (
      res
        .status(400)
        // 如果密碼不符合，回覆登入錯誤
        .json({ error: '帳號或密碼錯誤' })
    );
  }

  // 密碼符合就開始寫 session/cookie (或用 JWT 取代
  // （要先去 server.js 裡啟動 session）
  let returnUserInfo = {
    user_id: user.id,
    email: user.email,
    name: user.name,
    photo: user.photo,
  };
  // 因為 session 被修改過了，
  // express-session 就會幫我們把 session 存入store (此專案存在另建立的 sessions 資料夾)
  // 並把 session ID 存放在使用者瀏覽器cookie。
  req.session.user = returnUserInfo;
  // // 回覆資料給前端
  return res.json({ message: '登入成功', user: returnUserInfo });
});

// /api/auth/logout
router.get('/logout', (req, res, next) => {
  // 因為我們會依靠判斷 req.session.member 有沒有資料來當作有沒有登入
  // 所以當我們把 req.session.member 設定成 null，那就登出了
  req.session.user = null;
  return res.sendStatus(202); //.json({ success: '登出成功' });
});

// /api/auth/checkIsLogin
router.get('/checkIsLogin', (req, res, next) => {
  if (req.session.user) {
    // 表示登入過
    return res.json(req.session.user);
  } else {
    user;
    // 表示尚未登入
    return res.status(403).json({ error: '尚未登入' });
  }
});

// /api/auth/change-password
// 更改密碼頁面驗證規則
const changePasswordRules = [
  body('newPassword').isLength({ min: 8 }).withMessage('密碼長度至少為 8'),
  body('confirmNewPassword')
    .isLength({ min: 8 })
    .withMessage('密碼長度至少為 8'),
  body('newPassword')
    .custom((value, { req }) => {
      return value === req.body.confirmNewPassword;
    })
    .withMessage('新密碼與確認密碼欄位輸入不一致！'),
];

router.post('/change-password', changePasswordRules, async (req, res, next) => {
  // 前端的要放一個隱形的 input 塞 id 送來後端
  let [user] = await pool.execute(`SELECT passwords FROM user WHERE id = ?`, [
    req.body.user_id,
  ]);

  // 比對輸入密碼與資料庫的密碼是否一致(用 bcrypt 雜湊套件提供的方法)
  let passwordCompareResult = await bcrypt.compare(
    req.body.currentPassword,
    user[0]['passwords'] // 使用者存入資料庫的密碼(經雜湊)
  );

  // 如果比對錯誤就返回錯誤給前端
  if (passwordCompareResult === false) {
    return res.status(400).json({ error: '密碼錯誤！' });
  }

  // 驗證密碼資料欄位，會回傳一個陣列，若沒有驗證錯誤會回傳空陣列
  const validateResults = validationResult(req);
  // 不是 empty --> 表示有欄位沒通過驗證; 這邊 .isEmpty()、.array() 都是套件提供
  if (!validateResults.isEmpty()) {
    // 蒐集驗證失敗結果轉為一個陣列
    let error = validateResults.array();
    // 回傳失敗結果給前端
    return res.status(400).json({ errorColumns: error });
  }

  // 驗證都通過就將新密碼雜湊後 update 至資料庫
  let newHashPassword = await bcrypt.hash(req.body.newPassword, 10);
  await pool.execute(`UPDATE user SET passwords = ? WHERE id = ?`, [
    newHashPassword,
    req.body.user_id,
  ]);

  res.json({ success: '更改密碼成功！' });
});

module.exports = router;
