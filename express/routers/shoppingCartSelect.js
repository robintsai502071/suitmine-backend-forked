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

module.exports = router;

//     id: 1,
//     giver: '禮物卡暴發戶',
//     giver_user_id: 1,
//     receiver_user_id: 2,
//     amount: 3000,
