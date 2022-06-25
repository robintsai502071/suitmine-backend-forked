// express router 起手式三行
const express = require('express');
const router = express.Router();

const pool = require('../utils/db');
// 引入套件
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

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
// register
router.post('/register', registerRules, async (req, res, next) => {
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
  // TODO: user 資料寫進資料庫
  await pool.execute(
    'INSERT INTO user (name,email, passwords, gender, age, photo) VALUES (?,?,?,?,?,?)',
    [
      req.body.username,
      req.body.email,
      hashPassword,
      req.body.gender,
      req.body.age,
      req.body.photo,
    ]
  );

  // response
  res.json({ response: '註冊成功！' });
});

module.exports = router;
