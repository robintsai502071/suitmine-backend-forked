const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 取得特定 1 位 member 的資料
router.get('/:memberId', async (req, res, next) => {
  let [member] = await pool.execute(
    `SELECT 
  id,
  uid,
  name AS username,
  email,
  phone,
  gender,
  birth_date,
  address,
  weight,
  height,
  shoulder_width,
  chest_width,
  waist_width,
  butt_width,
  leg_length,
  arm_length 
  FROM user WHERE id = ?`,
    [req.params.memberId]
  );
  if (member.length === 0) {
    return res.status(400).json({ error: '獲取資料失敗！請重新登入' });
  }
  memberProfile = member[0];
  return res.json({ success: '獲取資料成功！', memberProfile });
});

// 修改特定 1 位 member 的資料
router.patch('/:memberId', async (req, res, next) => {
  //   update 特定 1 位 member 的資料
  await pool.execute(
    `UPDATE user
     SET name = ?,
     gender = ?,
     phone = ?,
     address = ?,
     height = ?,
     weight = ?,
     arm_length = ?,
     chest_width = ?,
     leg_length = ?,
     shoulder_width = ?,
     waist_width = ?,
     butt_width = ?,
     birth_date= ?
     WHERE id = ?`,
    [
      req.body.username,
      req.body.gender,
      req.body.phone,
      req.body.address,
      req.body.height,
      req.body.weight,
      req.body.arm_length,
      req.body.chest_width,
      req.body.leg_length,
      req.body.shoulder_width,
      req.body.waist_width,
      req.body.butt_width,
      req.body.birth_date,
      req.params.memberId,
    ]
  );

  return res.json({ success: '更新資料成功！' });
});

// 修改特定 1 位 member 的身體資訊
router.patch('/:memberId/body-info', async (req, res, next) => {
  //   update 特定 1 位 member 的資料
  let [response] = await pool.execute(
    `UPDATE user 
     SET height = ?, 
     weight = ?, 
     shoulder_width = ?, 
     chest_width = ?, 
     waist_width = ?, 
     leg_length = ?, 
     arm_length = ?
     WHERE id = ?`,
    [
      req.body.height,
      req.body.weight,
      req.body.shoulder_width,
      req.body.chest_width,
      req.body.waist_width,
      req.body.leg_length,
      req.body.arm_length,
      req.body.memberId,
    ]
  );

  return res.json({ success: '更新資料成功！' });
});

// 取得特定 1 位 member 所有的訂單資料
router.get('/:memberId/orders', async (req, res, next) => {
  let [orders] = await pool.execute(
    `
  SELECT 
  o.order_id,
  o.product_id,
  p.name AS product_name,
  p.price AS product_price,
  p.product_photo,
  o.count,
  o.create_time AS order_create_time,
  o.deliver_time AS order_deliver_time,
  o.finish_time AS order_finish_time,
  o.is_valid AS order_is_valid
  FROM orders o
  JOIN product p
  ON o.product_id = p.id
  WHERE user_id = ?
  GROUP BY o.order_id
  `,
    [req.params.memberId]
  );

  return res.json({ success: '獲取所有訂單資料成功！', orders });
});

// 取得特定 1 位 member 所有的禮物卡資料
router.get('/:memberId/giftcards', async (req, res, next) => {
  let [giftcards] = await pool.execute(
    `SELECT * FROM gift_card WHERE receiver_user_id = ?`,
    [req.params.memberId]
  );

  return res.json({ success: '獲取所有禮物卡資料成功！', giftcards });
});

// 取得特定 1 位 member 所有我的收藏資料
router.get('/:memberId/my-favorites', async (req, res, next) => {
  let [myFavorites] = await pool.execute(
    `
    SELECT
    mf.id,
    mf.product_id,
    p.name AS product_name,
    p.price AS product_price,
    p.product_photo
    FROM my_favorites mf
    JOIN product p
    ON mf.product_id = p.id
    WHERE user_id = ? 
    `,
    [req.params.memberId]
  );

  return res.json({ success: '獲取所有我的收藏資料成功！', myFavorites });
});

// 在特定 1 位 member 新增 1 筆我的收藏產品
router.post('/:memberId/my-favorites', async (req, res, next) => {
  let [reponse] = await pool.execute(
    `
    INSERT INTO my_favorites
     (user_id, product_id)
     VALUES (?, ?)
     `,
    [req.params.memberId, req.body.product_id]
  );

  return res.json({ success: '已將此商品新增至我的收藏！' });
});

// 在特定 1 位 member 刪除 1 筆我的收藏產品
router.delete('/:memberId/my-favorites', async (req, res, next) => {
  let [reponse] = await pool.execute(
    `
    DELETE FROM my_favorites
    WHERE user_id = ? AND product_id = ?
     `,
    [req.params.memberId, req.body.product_id]
  );

  return res.json({ success: '已從我的收藏刪除此商品！' });
});

// 取得特定 1 位 member 的特定 1 筆訂單資料
router.get('/:memberId/orders/:orderId', async (req, res, next) => {
  let [order] = await pool.execute(
    `
  SELECT
  o.order_id,
  o.product_id,
  p.name AS product_name,
  p.price AS product_price,
  p.product_photo,
  o.count,
  o.create_time AS order_create_time,
  o.deliver_time AS order_deliver_time,
  o.finish_time AS order_finish_time,
  o.is_valid AS order_is_valid 
  FROM 
  orders o
  JOIN product p
  ON o.product_id = p.id
  WHERE user_id =? AND  order_id = ?
  `,
    [req.params.memberId, req.params.orderId]
  );

  // 列出此訂單買的所有商品
  const order_content = [];
  for (let i = 0; i < order.length; i++) {
    order_content.push({
      product_id: order[i].product_id,
      product_name: order[i].product_name,
      product_price: order[i].product_price,
      product_count: order[i].count,
      product_photo: order[i].product_photo,
      amount_subtotal: order[i].product_price * order[i].count,
    });
  }

  // 計算出此訂單的總金額
  let amount_total = 0;
  for (let i = 0; i < order_content.length; i++) {
    amount_total += order_content[i].amount_subtotal;
  }

  order = {
    order_summary: {
      order_id: order[0].order_id,
      order_create_time: order[0].order_create_time,
      order_deliver_time: order[0].order_deliver_time,
      order_finish_time: order[0].order_finish_time,
      order_amount_total: amount_total,
      order_is_valid: order[0].order_is_valid,
    },
    order_content,
  };
  return res.json({ success: '獲取一筆訂單資料成功！', order });
});

module.exports = router;
