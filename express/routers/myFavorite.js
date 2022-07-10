const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 找特定我的最愛資料
router.get('/:menberId', async (req, res, next) => {
  let [user] = await pool.execute('SELECT id FROM user WHERE user.id = ?', [
    req.params.menberId,
  ]);

  let [giftCards] = await pool.execute(
    'SELECT my_favorites.* , product.name, product.product_photo, product.price FROM `my_favorites` JOIN product ON product.id = my_favorites.product_id WHERE my_favorites.user_id = ?',
    [user[0].id]
  );

  res.json({ user, giftCards });
});

module.exports = router;
