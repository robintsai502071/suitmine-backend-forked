// express router 起手式三行
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// register
router.post('/register', async (req, res, next) => {
  // TODO: 確認 email 有沒有註冊過
  let [result] = await pool.execute('SELECT * FROM user WHERE email = ?', [
    req.body.email,
  ]);

  if (result.length > 0)
    return res.status(400).json({ error: '此信箱已被註冊過！' });

  // TODO: user 資料寫進資料庫
  await pool.execute(
    'INSERT INTO user (name,email, passwords, gender, age, photo) VALUES (?,?,?,?,?,?)',
    [
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.gender,
      req.body.age,
      req.body.photo,
    ]
  );

  // response
  res.json({ result: '註冊成功！' });
});

module.exports = router;
