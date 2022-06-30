const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 取得特定 1 位 member 的資料
router.get('/:memberId', async (req, res, next) => {
  let [member] = await pool.execute(`SELECT * FROM user WHERE id = ?`, [
    req.params.memberId,
  ]);

  member = member[0];
  const returnMemberInfo = {
    id: member.id,
    name: member.name,
    gender: member.gender,
    age: member.age,
    phone: member.phone,
    photo: member.photo,
    email: member.email,
    valid: member.valid,
    address: member.address,
  };

  return res.json({ success: '獲取資料成功！', data: returnMemberInfo });
});

//   修改特定 1 位 member 的資料
router.patch('/:memberId', async (req, res, next) => {
  //   update 特定 1 位 member 的資料
  let [response] = await pool.execute(
    `UPDATE user SET name = ?, gender = ?, phone = ?, photo = ?,address = ? WHERE id = ?`,
    [
      req.body.name,
      req.body.gender,
      req.body.phone,
      req.body.photo,
      req.body.address,
      req.params.memberId,
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
