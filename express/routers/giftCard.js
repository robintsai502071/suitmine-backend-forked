const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 找特定禮物卡資料
router.get('/:menberId', async (req, res, next) => {
  let [user] = await pool.execute('SELECT email FROM user WHERE user.id = ?', [
    req.params.menberId,
  ]);

  let [giftCards] = await pool.execute(
    'SELECT gift_card.id, gift_card.giver, gift_card.create_time, gift_card.amount, gift_card.is_used, gift_card.message  FROM gift_card  WHERE gift_card.receiver_email = ?',
    [user[0].email]
  );

  res.json({ user, giftCards });
});

module.exports = router;
