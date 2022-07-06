const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/:menberId', async (req, res, next) => {
  console.log('in');
  let [user] = await pool.execute('SELECT * FROM user WHERE user.id = ?', [
    req.params.menberId,
  ]);
  let [giftCardList] = await pool.execute(
    'SELECT gift_card.id, gift_card.giver, gift_card.giver_user_id, gift_card.receiver_user_id, gift_card.amount FROM gift_card WHERE gift_card.is_used = 0 AND gift_card.receiver_email = ?',
    [user[0].email]
  );

  res.json({ user, giftCardList });
});

// 新增訂單
router.post('/:memberId/uploadOrder', async (req, res, next) => {
  let [reponse] = await pool.execute(
    `INSERT INTO orders( order_id, user_id, product_id, gift_card_id, count) VALUES ( ? , ? , ? , ? , ?)`,
    [
      req.params.order_id,
      req.params.memberId,
      req.params.product_id,
      req.params.gift_card_id,
      req.params.count,
    ]
  );

  return res.json({ success: '已新增至我的訂單！' });
});

module.exports = router;
