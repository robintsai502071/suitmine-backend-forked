const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

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

// **取得特定 1 位 member 所有的訂單資料
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

// 取得特定 1 位 member 的特定 1 筆訂單資料
router.get('/:memberId/orders/:orderId', async (req, res, next) => {
  const [order] = await pool.execute(
    `
  SELECT
  o.id,
  o.order_uuid,
  o.user_id,
  o.cart_total,
  o.shipping_fee,
  o.receiver_name,
  o.receiver_phone,
  o.receiver_address,
  o.create_time,
  u.name AS customer_name,
  u.birth_date AS customer_birth,
  u.phone AS customer_phone
  FROM 
  orders o
  JOIN user u
  ON o.user_id = u.id
  WHERE o.user_id = ? AND o.id = ?
  `,
    [req.params.memberId, req.params.orderId]
  );
  const orderDetail = order[0];
  const [orderItems] = await pool.execute(
    `
  SELECT 
  oi.id,
  oi.order_id,
  oi.product_id,
  oi.quantity,
  p.name AS product_name,
  p.product_photo,
  p.price AS product_price
  FROM 
  order_items oi
  JOIN product p
  ON oi.product_id = p.id
  WHERE oi.order_id = ?
  `,
    [req.params.orderId]
  );

  return res.json({
    success: '獲取一筆訂單資料成功！',
    orderDetail,
    orderItems,
  });
});

// 建立特定 1 位 member 1 筆訂單資料
router.post('/:memberId/orders', async (req, res, next) => {
  const { formData, cartSummary } = req.body;
  const { receiverName, receiverPhone, receiverAddress } = formData;
  const { cartItems, cartTotal, shippingFee } = cartSummary;

  let [response] = await pool.execute(
    `INSERT INTO orders
    (order_uuid, user_id, cart_total, shipping_fee, receiver_name, receiver_phone, receiver_address)
    VALUES (?,?,?,?,?,?,?)`,
    [
      uuidv4(),
      req.params.memberId,
      cartTotal,
      shippingFee,
      receiverName,
      receiverPhone,
      receiverAddress,
    ]
  );
  const lastInsertedOrderId = response.insertId;
  for (let i = 0; i < cartItems.length; i++) {
    await pool.execute(
      `INSERT INTO order_items
      (order_id, product_id, quantity)
      VALUES (?,?,?)`,
      [lastInsertedOrderId, cartItems[i].id, cartItems[i].quantity]
    );
  }
  return res.json({ success: '建立訂單成功！', order_id: lastInsertedOrderId });
});

// **取得特定 1 位 member 所有我的收藏資料
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



module.exports = router;
