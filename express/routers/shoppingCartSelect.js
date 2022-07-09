const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 新增訂單
router.post('/uploadOrder', async (req, res, next) => {
  // orderList
  const { v4: uuidv4 } = require('uuid');
  const orderId = uuidv4();
  const arr = [];

  // 新增商品訂單;
  for (let i = 0; i < req.body.productlist.length; i++) {
    let [reponse] = await pool.execute(
      `INSERT INTO orders( order_id, user_id, product_id, gift_card_id, count) VALUES ( ? , ? , ? , ? , ?)`,
      [
        orderId,
        req.body.memberId,
        req.body.productlist[i].product_id,
        req.body.gift_card_id,
        req.body.productlist[i].count,
      ]
    );
  }

  // 新增禮物卡
  for (let i = 0; i < req.body.productlist.length; i++) {
    let [reponse] = await pool.execute(
      `INSERT INTO gift_card(giver, giver_user_id, receiver,  amount, message, receiver_email) VALUES ( ? , ? , ? , ? , ? , ? )`,
      [
        req.body.giftCardlist[i].giver,
        req.body.giftCardlist[i].giver_user_id,
        req.body.giftCardlist[i].reciver,
        req.body.giftCardlist[i].amount,
        req.body.giftCardlist[i].message,
        req.body.giftCardlist[i].giftCardEmail,
      ]
    );
    // 找出該新增的禮物卡id
    arr.push(reponse.insertId);
  }

  // 新增訂單-禮物卡(以新增的禮物卡id INSERT);
  for (let i = 0; i < arr.length; i++) {
    let [reponse] = await pool.execute(
      `INSERT INTO orders( order_id, user_id, product_giftcard_id, gift_card_id) VALUES ( ? , ? , ? , ?)`,
      [orderId, req.body.memberId, arr[i], req.body.gift_card_id]
    );
  }

  //修改已使用禮物卡狀態
  let [reponse] = await pool.execute(
    `UPDATE gift_card SET is_used= 1 WHERE id = ?`,
    [req.body.gift_card_id]
  );

  //修改會員地址、身體資訊
  let [response] = await pool.execute(
    `UPDATE user SET height= ? ,shoulder_width= ? ,chest_width= ? ,waist_width= ? ,leg_length= ? ,arm_length= ? ,address= ?  WHERE id = ? `,
    [
      req.body.bodyList.height,
      req.body.bodyList.shoulder_width,
      req.body.bodyList.chest_width,
      req.body.bodyList.waist_width,
      req.body.bodyList.leg_length,
      req.body.bodyList.arm_length,
      req.body.updateAddress,
      req.body.memberId,
    ]
  );

  return res.json({ success: '已新增商品至我的訂單、建立新禮物卡！' });
});

// 找特定會員購物車資料
router.get('/:menberId', async (req, res, next) => {
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
