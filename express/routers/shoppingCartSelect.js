const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/:menberId', async (req, res, next) => {
  let [user] = await pool.execute('SELECT * FROM user WHERE user.id = ?', [
    req.params.menberId,
  ]);
  let [giftCardList] = await pool.execute(
    'SELECT * FROM gift_card WHERE gift_card.is_used = 0 AND gift_card.receiver_email = ?',
    [user[0].email]
  );

  res.json({ user, giftCardList });
});

module.exports = router;
