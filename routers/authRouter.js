// express router 起手式三行
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 引入驗證、雜湊套件
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

require('dotenv').config();

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
router.post('/register', registerRules, async (req, res, next) => {
  // 確認 email 有沒有註冊過
  let [result] = await pool.execute('SELECT * FROM user WHERE email = ?', [
    req.body.email,
  ]);

  if (result.length > 0)
    return res.status(400).json({ error: '此信箱已被註冊過！' });

  // 驗證資料欄位，會回傳一個陣列，若沒有驗證錯誤會回傳空陣列
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

  // 將 user 資料寫進資料庫
  let [response] = await pool.execute(
    'INSERT INTO user (name, email, password, gender, birth_date) VALUES (?,?,?,?,?)',
    [
      req.body.username,
      req.body.email,
      hashPassword,
      req.body.gender,
      req.body.birth_date,
    ]
  );
  const user_id = response.insertId;

  const returnUserInfo = {
    user_id,
    email: req.body.email,
    name: req.body.username,
  };
  req.session.user = returnUserInfo;
  res.json({ success: '註冊成功！', user: returnUserInfo });
});

// /api/auth/login
router.post('/login', async (req, res, next) => {
  // 確認資料有收到
  // 確認有沒有這個帳號
  let [user] = await pool.execute(
    'SELECT id, name ,email, password, photo FROM user WHERE email = ?',
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
    user.password
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
    // photo: user.photo,
  };
  // 因為 session 被修改過了，
  // express-session 就會幫我們把 session 存入 store (此專案直接放置於根目錄)
  // 並把 session ID 存放在使用者瀏覽器 cookie。
  req.session.user = returnUserInfo;
  // // 回覆資料給前端
  return res.json({ message: '登入成功', user: returnUserInfo });
});

// /api/auth/login-with-google
router.post('/login-with-google', async (req, res, next) => {
  // 確認這個有沒有這個帳號
  let [user] = await pool.execute(
    'SELECT id, uid, name ,email, password, photo FROM user WHERE email = ?',
    [req.body.email]
  );

  // user 撈出來是一個陣列，有撈到資料代表有註冊過
  // 情況一：如果沒有註冊過就直接建立一個新的帳號並且也要直接登入
  if (user.length === 0) {
    const [response] = await pool.execute(
      'INSERT INTO user (name, email, uid) VALUES (?,?,?)',
      [req.body.displayName, req.body.email, req.body.uid]
    );

    // 開始寫 session/cookie (或用 JWT 取代
    // （要先去 server.js 裡啟動 session）
    let returnUserInfo = {
      user_id: response.insertId,
      uid: req.body.uid,
      email: req.body.email,
      name: req.body.displayName,
      // photo: null,
    };
    // 因為 session 被修改過了，
    // express-session 就會幫我們把 session 存入 store (此專案直接放置於根目錄)
    // 並把 session ID 存放在使用者瀏覽器 cookie。
    req.session.user = returnUserInfo;

    // 回覆資料給前端
    return res.json({ message: '登入成功', user: returnUserInfo });
  }

  // 情況二：此 gmail 已於官網註冊過了
  user = user[0];
  if (user.uid === null) {
    return res.status(400).json({
      error: '登入失敗',
      errorMessage: '此 Gmail 已於官方網站註冊過！請改用信箱/密碼方式登入。',
    });
  }

  // 情況三：此 user 已用 google 登入過
  let returnUserInfo = {
    user_id: user.id,
    uid: req.body.uid,
    email: user.email,
    name: user.name,
    // photo: null,
  };

  req.session.user = returnUserInfo;
  // // 回覆資料給前端
  return res.json({ message: '登入成功', user: returnUserInfo });
});

// /api/auth/logout
router.get('/logout', (req, res, next) => {
  // 因為我們會依靠判斷 req.session.member 有沒有資料來當作有沒有登入
  // 所以當我們把 req.session.member 設定成 null，那就登出了
  req.session.user = null;
  return res.sendStatus(202);
});

// /api/auth/checkIsLogin
router.get('/check-is-login', (req, res, next) => {
  if (req.session.user) {
    // 表示登入過
    return res.json(req.session.user);
  } else {
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
  // 測試帳號不能修改密碼
  if (req.body.user_id === 44) {
    return res
      .status(400)
      .json({ error: '很抱歉，此帳號為測試帳號，無法修改密碼！' });
  }

  // 前端的要放一個隱形的 input 塞 id 送來後端
  let [user] = await pool.execute(`SELECT password FROM user WHERE id = ?`, [
    req.body.user_id,
  ]);

  // 比對輸入密碼與資料庫的密碼是否一致(用 bcrypt 雜湊套件提供的方法)
  let passwordCompareResult = await bcrypt.compare(
    req.body.currentPassword,
    user[0]['password'] // 使用者存入資料庫的密碼(經雜湊)
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
  await pool.execute(`UPDATE user SET password = ? WHERE id = ?`, [
    newHashPassword,
    req.body.user_id,
  ]);

  res.json({ success: '更改密碼成功！' });
});

module.exports = router;
